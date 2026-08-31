import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { getLocalDateString } from '../../utils/formatters';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const CalendarView = ({ selectedDate, onSelectDate, events = [] }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // First day of the month & total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // Get weekday of 1st day (0 is Sun, convert so Mon is 0)
  let startOffset = firstDay.getDay() - 1;
  if (startOffset === -1) startOffset = 6;

  const todayStr = getLocalDateString(new Date());

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    onSelectDate(getLocalDateString(today));
  };

  // Build days array
  const calendarCells = [];
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push({ key: `empty-${i}`, empty: true });
  }

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;

    const dayEvents = events.filter(e => {
      const eDate = (e.dateTime || '').slice(0, 10);
      return eDate === dateKey;
    });

    calendarCells.push({
      key: dateKey,
      dateKey,
      dayNum,
      isToday: dateKey === todayStr,
      isSelected: dateKey === selectedDate,
      eventsCount: dayEvents.length,
      hasWon: dayEvents.some(e => e.status === 'won'),
      hasOngoing: dayEvents.some(e => e.status === 'ongoing'),
    });
  }

  return (
    <View style={styles.container}>
      {/* Month & Year Navigator */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={prevMonth} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={THEME.colors.textMain} />
        </TouchableOpacity>

        <View style={styles.monthTitleBox}>
          <Ionicons name="calendar" size={18} color={THEME.colors.primary} />
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[month]} {year}
          </Text>
        </View>

        <View style={styles.rightNavGroup}>
          <TouchableOpacity style={styles.todayBtn} onPress={jumpToToday} activeOpacity={0.7}>
            <Text style={styles.todayBtnText}>Hoy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={nextMonth} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMain} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekdays Row */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((wd, idx) => (
          <View key={idx} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {calendarCells.map((cell) => {
          if (cell.empty) {
            return <View key={cell.key} style={styles.dayCellEmpty} />;
          }

          return (
            <TouchableOpacity
              key={cell.key}
              style={[
                styles.dayCell,
                cell.isToday && styles.dayCellToday,
                cell.isSelected && styles.dayCellSelected,
              ]}
              onPress={() => onSelectDate(cell.dateKey)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumText,
                  cell.isToday && styles.dayNumToday,
                  cell.isSelected && styles.dayNumSelected,
                ]}
              >
                {cell.dayNum}
              </Text>

              {cell.eventsCount > 0 && (
                <View style={styles.dotsRow}>
                  <View style={[styles.dot, cell.hasWon ? styles.dotWon : styles.dotActive]} />
                  {cell.eventsCount > 1 && (
                    <View style={[styles.dot, styles.dotSecondary]} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.bgDark,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    color: THEME.colors.textMain,
    fontSize: 16,
    fontWeight: '800',
  },
  rightNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    padding: 8,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  todayBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.primaryDark,
  },
  todayBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 99, 235, 0.15)',
    paddingBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 42,
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radius.sm,
    paddingVertical: 2,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  dayCellSelected: {
    backgroundColor: THEME.colors.primary,
  },
  dayNumText: {
    color: THEME.colors.textMain,
    fontSize: 13,
    fontWeight: '700',
  },
  dayNumToday: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  dayNumSelected: {
    color: '#ffffff',
    fontWeight: '900',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    backgroundColor: THEME.colors.primary,
  },
  dotWon: {
    backgroundColor: THEME.colors.success,
  },
  dotSecondary: {
    backgroundColor: THEME.colors.accent,
  },
});
