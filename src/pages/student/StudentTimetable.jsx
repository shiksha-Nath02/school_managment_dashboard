import { useState, useEffect } from 'react';
import { getStudentTimetable } from '@/services/timetableService';
import { SCHOOL_DAYS, PERIODS } from '@/constants';
import { Calendar } from 'lucide-react';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await getStudentTimetable();
        setTimetable(res.data.timetable || {});
      } catch (err) {
        console.error('Error fetching timetable:', err);
      }
      setLoading(false);
    };
    fetchTimetable();
  }, []);

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (modifier === 'PM' && h !== 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    return [h, m];
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const period of PERIODS) {
      const [startH, startM] = parseTime(period.startTime);
      const [endH, endM] = parseTime(period.endTime);
      if (currentTime >= startH * 60 + startM && currentTime < endH * 60 + endM) {
        return period.number;
      }
    }
    return null;
  };

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-outfit flex items-center gap-2">
          <Calendar className="w-7 h-7 text-[#1A5276]" />
          My Timetable
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-dm-sans">Your weekly class schedule</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Loading timetable...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#E3EEF5]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A5276] uppercase tracking-wider font-outfit w-[140px]">
                    Period
                  </th>
                  {SCHOOL_DAYS.map(day => (
                    <th
                      key={day}
                      className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider font-outfit ${
                        day === today ? 'text-white bg-[#1A5276]' : 'text-[#1A5276]'
                      }`}
                    >
                      {day}
                      {day === today && <span className="ml-1 text-[10px] font-normal">(Today)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pIndex) => (
                  <tr key={period.number} className={pIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 border-t border-gray-100">
                      <div className={`font-semibold text-sm font-outfit flex items-center gap-2 ${
                        currentPeriod === period.number ? 'text-[#1A5276]' : 'text-gray-800'
                      }`}>
                        Period {period.number}
                        {currentPeriod === period.number && (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-dm-sans">{period.startTime} – {period.endTime}</div>
                    </td>
                    {SCHOOL_DAYS.map(day => {
                      const slot = timetable[day]?.[pIndex];
                      const isCurrentSlot = day === today && currentPeriod === period.number;
                      return (
                        <td
                          key={day}
                          className={`px-2 py-3 border-t text-center ${
                            isCurrentSlot
                              ? 'bg-[#1A5276]/5 border-[#1A5276]/20'
                              : day === today
                                ? 'bg-blue-50/30 border-gray-100'
                                : 'border-gray-100'
                          }`}
                        >
                          <span className={`text-sm font-dm-sans ${
                            slot?.subject
                              ? isCurrentSlot ? 'text-[#1A5276] font-bold' : 'text-gray-700 font-medium'
                              : 'text-gray-300 italic'
                          }`}>
                            {slot?.subject || '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
