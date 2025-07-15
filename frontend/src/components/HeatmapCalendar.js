import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import moment from 'moment';

function HeatmapCalendar({ completionDates }) {
  const today = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(6, 'months').format('YYYY-MM-DD');

  const values = (completionDates || []).map(date => ({ date, count: 1 }));

  return (
    <div className="my-2">
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={values}
        classForValue={value => {
          if (!value) return 'color-empty';
          return 'color-github-3';
        }}
        showWeekdayLabels
      />
    </div>
  );
}

export default HeatmapCalendar;