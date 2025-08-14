import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkFetchAllScores, clearError } from '../../redux/jobResumeScore';

function MatchHistory() {
  const dispatch = useDispatch();

  const allScores = useSelector(state => state.resumeJobScore.allScores);
  const error = useSelector(state => state.resumeJobScore.error);

  useEffect(() => {
    dispatch(thunkFetchAllScores());

    return () => dispatch(clearError());
  }, [dispatch]);

  if (error) return <div>Error: {error.server || JSON.stringify(error)}</div>;

  if (!allScores || allScores.length === 0) return <div>Loading matched jobs and resumes...</div>;

  // 按 job_id 分组
  const jobsMap = new Map();
  allScores.forEach(score => {
    if (!jobsMap.has(score.job_id)) {
      jobsMap.set(score.job_id, {
        job_id: score.job_id,
        matches: [],
      });
    }
    jobsMap.get(score.job_id).matches.push(score);
  });

  // 转成数组并按 job_id 降序排列
  const jobsWithMatches = Array.from(jobsMap.values()).sort((a, b) => b.job_id - a.job_id);

  return (
    <div>
      <h2>Match History (All Jobs)</h2>
      {jobsWithMatches.length === 0 && <div>No matched jobs found.</div>}
      {jobsWithMatches.map(job => {
        // 当前 job 的 resumes 按 match_score 降序排序
        const sortedMatches = job.matches
          ? [...job.matches].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
          : [];

        return (
          <div key={job.job_id} style={{ marginBottom: 40 }}>
            <h3>Job ID: {job.job_id}</h3>
            {!sortedMatches.length ? (
              <p>No matches found for this job.</p>
            ) : (
              <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th>Resume ID</th>
                    <th>Match Score</th>
                    <th>Skills Score</th>
                    <th>Experience Score</th>
                    <th>Latest Resume Analysis (Overall Score & Suggestions)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMatches.map(score => {
                    // 找出最新的 resume_analyses (按 evaluated_at 降序取第一个)
                    let latestAnalysis = null;
                    if (score.resume_analyses && score.resume_analyses.length > 0) {
                      latestAnalysis = [...score.resume_analyses].sort((a, b) => new Date(b.evaluated_at) - new Date(a.evaluated_at))[0];
                    }

                    return (
                      <tr key={score.id}>
                        <td>{score.resume_id}</td>
                        <td>{score.match_score?.toFixed(2)}</td>
                        <td>{score.score_skills?.toFixed(2)}</td>
                        <td>{score.score_experience?.toFixed(2)}</td>
                        <td>
                          {latestAnalysis ? (
                            <div style={{ marginBottom: 8, borderBottom: '1px solid #ccc' }}>
                              <div><strong>Overall:</strong> {latestAnalysis.score_overall?.toFixed(2)}</div>
                              <div><strong>Strengths:</strong> {latestAnalysis.strengths || 'N/A'}</div>
                              <div><strong>Weaknesses:</strong> {latestAnalysis.weaknesses || 'N/A'}</div>
                              <div><strong>Suggestions:</strong> {latestAnalysis.suggestions || 'N/A'}</div>
                              <div><small>Evaluated At: {new Date(latestAnalysis.evaluated_at).toLocaleDateString()}</small></div>
                            </div>
                          ) : (
                            <div>No analysis available</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MatchHistory;
