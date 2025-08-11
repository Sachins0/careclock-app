import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { groupBy, orderBy } from 'lodash';

// Types for chart data
export interface ChartDataPoint {
  x: string | Date;
  y: number;
  label?: string;
  metadata?: any;
}

export interface DashboardMetrics {
  dailyClockIns: ChartDataPoint[];
  weeklyHoursByStaff: ChartDataPoint[];
  shiftDurations: ChartDataPoint[];
  locationHeatmap: ChartDataPoint[];
  hourlyDistribution: ChartDataPoint[];
  monthlyTrends: ChartDataPoint[];
}

// Process daily clock-ins data
export function processDailyClockIns(shifts: any[], days: number = 7): ChartDataPoint[] {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  
  const dailyData: { [key: string]: number } = {};
  
  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, days - 1 - i);
    const dateKey = format(date, 'yyyy-MM-dd');
    dailyData[dateKey] = 0;
  }
  
  // Count clock-ins per day
  shifts.forEach(shift => {
    if (shift.clockInTime) {
      const clockInDate = new Date(shift.clockInTime);
      const dateKey = format(clockInDate, 'yyyy-MM-dd');
      
      if (dailyData.hasOwnProperty(dateKey)) {
        dailyData[dateKey]++;
      }
    }
  });
  
  return Object.entries(dailyData).map(([date, count]) => ({
    x: date,
    y: count,
    label: format(new Date(date), 'MMM dd'),
  }));
}

// Process weekly hours by staff
export function processWeeklyHoursByStaff(shifts: any[]): ChartDataPoint[] {
  const weekStart = subDays(new Date(), 7);
  const weeklyShifts = shifts.filter(shift => {
    if (!shift.clockInTime) return false;
    const shiftDate = new Date(shift.clockInTime);
    return shiftDate >= weekStart;
  });
  
  const staffHours = groupBy(weeklyShifts, 'user.name');
  
  return Object.entries(staffHours).map(([staffName, userShifts]) => {
    const totalMinutes = userShifts.reduce((sum, shift) => {
      return sum + (shift.durationMinutes || 0);
    }, 0);
    
    return {
      x: staffName,
      y: Math.round((totalMinutes / 60) * 10) / 10, // Round to 1 decimal
      label: staffName,
      metadata: {
        shiftCount: userShifts.length,
        totalMinutes,
      },
    };
  }).sort((a, b) => b.y - a.y); // Sort by hours desc
}

// Process shift duration distribution
export function processShiftDurations(shifts: any[]): ChartDataPoint[] {
  const completedShifts = shifts.filter(shift => 
    shift.status === 'COMPLETED' && shift.durationMinutes
  );
  
  // Group by duration ranges
  const ranges = [
    { min: 0, max: 240, label: '0-4h' },      // 0-4 hours
    { min: 240, max: 480, label: '4-8h' },    // 4-8 hours
    { min: 480, max: 720, label: '8-12h' },   // 8-12 hours
    { min: 720, max: 1440, label: '12-24h' }, // 12-24 hours
    { min: 1440, max: Infinity, label: '24h+' }, // 24+ hours
  ];
  
  return ranges.map(range => {
    const count = completedShifts.filter(shift => 
      shift.durationMinutes >= range.min && shift.durationMinutes < range.max
    ).length;
    
    return {
      x: range.label,
      y: count,
      label: range.label,
      metadata: { range },
    };
  });
}

// Process hourly distribution (when do people clock in)
export function processHourlyDistribution(shifts: any[]): ChartDataPoint[] {
  const hourCounts: { [hour: number]: number } = {};
  
  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }
  
  shifts.forEach(shift => {
    if (shift.clockInTime) {
      const hour = new Date(shift.clockInTime).getHours();
      hourCounts[hour]++;
    }
  });
  
  return Object.entries(hourCounts).map(([hour, count]) => ({
    x: `${hour.padStart(2, '0')}:00`,
    y: count,
    label: `${hour}:00`,
    metadata: { hour: parseInt(hour) },
  }));
}

// Calculate KPI metrics
export interface KPIMetrics {
  totalActiveStaff: number;
  avgShiftDurationToday: number;
  totalShiftsToday: number;
  totalHoursToday: number;
  onTimeClockInRate: number;
  avgHoursPerStaffThisWeek: number;
  totalStaffCount: number;
  utilizationRate: number;
}

export function calculateKPIMetrics(shifts: any[], users: any[]): KPIMetrics {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());
  const weekStart = subDays(new Date(), 7);
  
  // Today's shifts
  const todayShifts = shifts.filter(shift => {
    if (!shift.clockInTime) return false;
    const shiftDate = new Date(shift.clockInTime);
    return isWithinInterval(shiftDate, { start: today, end: tomorrow });
  });
  
  // This week's shifts
  const weekShifts = shifts.filter(shift => {
    if (!shift.clockInTime) return false;
    const shiftDate = new Date(shift.clockInTime);
    return shiftDate >= weekStart;
  });
  
  // Active staff (currently on shift)
  const activeStaff = shifts.filter(shift => shift.status === 'ACTIVE');
  
  // Completed shifts today
  const completedToday = todayShifts.filter(shift => 
    shift.status === 'COMPLETED' && shift.durationMinutes
  );
  
  // Calculate metrics
  const totalActiveStaff = activeStaff.length;
  const avgShiftDurationToday = completedToday.length > 0
    ? completedToday.reduce((sum, shift) => sum + shift.durationMinutes, 0) / completedToday.length / 60
    : 0;
  
  const totalShiftsToday = todayShifts.length;
  const totalHoursToday = todayShifts.reduce((sum, shift) => 
    sum + (shift.durationMinutes || 0), 0) / 60;
  
  const weeklyHours = weekShifts.reduce((sum, shift) => 
    sum + (shift.durationMinutes || 0), 0) / 60;
  const avgHoursPerStaffThisWeek = users.length > 0 ? weeklyHours / users.length : 0;
  
  const utilizationRate = users.length > 0 ? (totalActiveStaff / users.length) * 100 : 0;
  
  return {
    totalActiveStaff,
    avgShiftDurationToday: Math.round(avgShiftDurationToday * 10) / 10,
    totalShiftsToday,
    totalHoursToday: Math.round(totalHoursToday * 10) / 10,
    onTimeClockInRate: 95, // Placeholder - would need clock-in time vs scheduled time
    avgHoursPerStaffThisWeek: Math.round(avgHoursPerStaffThisWeek * 10) / 10,
    totalStaffCount: users.length,
    utilizationRate: Math.round(utilizationRate * 10) / 10,
  };
}

// Format chart data for Chart.js
export function formatLineChartData(
  data: ChartDataPoint[],
  label: string,
  color: string
) {
  return {
    labels: data.map(d => d.label || d.x),
    datasets: [
      {
        label,
        data: data.map(d => d.y),
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
      },
    ],
  };
}

export function formatBarChartData(
  data: ChartDataPoint[],
  label: string,
  colors?: string[]
) {
  return {
    labels: data.map(d => d.label || d.x),
    datasets: [
      {
        label,
        data: data.map(d => d.y),
        backgroundColor: colors || data.map((_, i) => 
          `hsl(${(i * 137.5) % 360}, 70%, 60%)`
        ),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };
}
