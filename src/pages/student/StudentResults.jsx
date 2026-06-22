import { useState, useEffect } from 'react';
import { getOwnResults } from '@/services/marksService';
import { EXAM_TYPES, GRADE_COLORS } from '@/constants';
import { Award, TrendingUp, BarChart3, AlertTriangle, Loader2, Target } from 'lucide-react';

const StudentResults = () => {
  const [examType, setExamType] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableExams, setAvailableExams] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await getOwnResults(examType);
        setData(res.data);
        if (res.data.available_exams) setAvailableExams(res.data.available_exams);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchResults();
  }, [examType]);

  const getExamLabel = (value) => EXAM_TYPES.find(e => e.value === value)?.label || value;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading results...
      </div>
    );
  }

  const marks = data?.marks || [];
  const analytics = data?.exam_analytics || {};

  // When "all" is selected, show first exam's analytics summary
  const currentAnalytics = examType !== 'all'
    ? analytics[examType]
    : Object.values(analytics)[0];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-outfit flex items-center gap-2">
            <Award className="w-7 h-7 text-[#1A5276]" />
            My Results
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-dm-sans">
            Your exam results and performance analytics
          </p>
        </div>
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-dm-sans focus:ring-2 focus:ring-[#1A5276]/20 focus:border-[#1A5276]"
        >
          <option value="all">All Exams</option>
          {availableExams.map(et => (
            <option key={et} value={et}>{getExamLabel(et)}</option>
          ))}
        </select>
      </div>

      {marks.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-dm-sans">No results available yet.</p>
        </div>
      ) : (
        <>
          {/* Analytics Cards */}
          {currentAnalytics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#E3EEF5] border border-[#1A5276]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#1A5276] text-xs font-dm-sans mb-1">
                  <Award className="w-4 h-4" /> Class Rank
                </div>
                <div className="text-2xl font-bold text-[#1A5276] font-outfit">
                  #{currentAnalytics.rank}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    / {currentAnalytics.total_students}
                  </span>
                </div>
              </div>

              <div className="bg-[#E3EEF5] border border-[#1A5276]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#1A5276] text-xs font-dm-sans mb-1">
                  <TrendingUp className="w-4 h-4" /> Percentile
                </div>
                <div className="text-2xl font-bold text-[#1A5276] font-outfit">
                  {currentAnalytics.percentile}%
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Better than {currentAnalytics.percentile}% of class
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-dm-sans mb-1">
                  <Target className="w-4 h-4" /> Your Score
                </div>
                <div className="text-2xl font-bold text-gray-800 font-outfit">
                  {currentAnalytics.your_total}/{currentAnalytics.your_max_total}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{currentAnalytics.your_percentage}%</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs text-gray-400 font-dm-sans mb-1">Class Average</div>
                <div className="text-lg font-bold text-gray-700 font-outfit">
                  {currentAnalytics.class_average_total}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs text-gray-400 font-dm-sans mb-1">Highest in Class</div>
                <div className="text-lg font-bold text-green-600 font-outfit">
                  {currentAnalytics.class_highest_total}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs text-gray-400 font-dm-sans mb-1">Lowest in Class</div>
                <div className="text-lg font-bold text-red-500 font-outfit">
                  {currentAnalytics.class_lowest_total}
                </div>
              </div>
            </div>
          )}

          {/* Areas to Improve */}
          {currentAnalytics?.areas_to_improve?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-amber-700 font-outfit flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Areas to Improve
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentAnalytics.areas_to_improve.map(area => (
                  <div
                    key={area.subject}
                    className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm font-dm-sans"
                  >
                    <span className="font-medium text-amber-700">{area.subject}</span>
                    <span className="text-gray-500 ml-2">
                      You: {area.your_marks}/{area.max_marks} • Avg: {area.class_average}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject vs Class Average bar chart */}
          {currentAnalytics && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-800 font-outfit mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1A5276]" /> Your Score vs Class Average
              </h3>
              <div className="space-y-3">
                {marks
                  .filter(m => !m.is_absent && (examType === 'all' || m.exam_type === examType))
                  .map(m => {
                    const yourPct = m.max_marks > 0 ? (m.marks_obtained / m.max_marks) * 100 : 0;
                    const avgPct = m.subject_analytics
                      ? (m.subject_analytics.class_average / m.max_marks) * 100
                      : 0;

                    return (
                      <div key={`${m.exam_type}-${m.subject}`}>
                        <div className="flex items-center justify-between text-xs font-dm-sans mb-1">
                          <span className="text-gray-700 font-medium">
                            {m.subject}
                            {examType === 'all' && (
                              <span className="text-gray-400 ml-1">({getExamLabel(m.exam_type)})</span>
                            )}
                          </span>
                          <span className="text-gray-500">{m.marks_obtained}/{m.max_marks}</span>
                        </div>
                        <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                          {/* Class average marker */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                            style={{ left: `${Math.min(avgPct, 100)}%` }}
                            title={`Class avg: ${m.subject_analytics?.class_average}`}
                          />
                          {/* Your score bar */}
                          <div
                            className={`h-full rounded-full transition-all ${
                              yourPct >= avgPct ? 'bg-[#1A5276]' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(yourPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-dm-sans">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[#1A5276] rounded-full inline-block" /> Your score
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-gray-400 inline-block" /> Class average
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-amber-500 rounded-full inline-block" /> Below average
                </span>
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#E3EEF5]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A5276] uppercase font-outfit">Subject</th>
                  {examType === 'all' && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A5276] uppercase font-outfit">Exam</th>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#1A5276] uppercase font-outfit">Marks</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#1A5276] uppercase font-outfit">%</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#1A5276] uppercase font-outfit">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A5276] uppercase font-outfit">Remark</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m, i) => (
                  <tr
                    key={`${m.exam_type}-${m.subject}`}
                    className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 font-dm-sans">{m.subject}</td>
                    {examType === 'all' && (
                      <td className="px-4 py-3 text-sm text-gray-500 font-dm-sans">{getExamLabel(m.exam_type)}</td>
                    )}
                    <td className="px-4 py-3 text-sm text-center font-dm-sans text-gray-700">
                      {m.is_absent ? (
                        <span className="text-gray-400 italic">Absent</span>
                      ) : (
                        `${m.marks_obtained} / ${m.max_marks}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-dm-sans text-gray-700">
                      {m.percentage !== null ? `${m.percentage}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold font-outfit ${GRADE_COLORS[m.grade] || GRADE_COLORS['AB']}`}>
                        {m.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-dm-sans">
                      {m.remark || <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentResults;
