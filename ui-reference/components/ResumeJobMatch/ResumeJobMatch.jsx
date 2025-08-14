import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { thunkMatchResumeToJob, clearMatchResult } from "../../redux/aiJobResumeScore";

const ResumeJobMatch = () => {
  // Get jobId and resumeId from URL params
  const { jobId, resumeId } = useParams();

  const dispatch = useDispatch();
  const matchResult = useSelector(state => state.jobResumeScore.currentMatch);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatch = async () => {
    setLoading(true);
    setError(null);
    const errorData = await dispatch(thunkMatchResumeToJob(jobId, resumeId));
    if (errorData) {
      setError(errorData.error || "Failed to fetch match result");
    }
    setLoading(false);
  };

  useEffect(() => {
    // Only fetch if jobId and resumeId exist
    if (jobId && resumeId) {
      fetchMatch();
    } else {
      setError("Missing jobId or resumeId in URL");
      setLoading(false);
    }

    return () => {
      dispatch(clearMatchResult());
    };
  }, [dispatch, jobId, resumeId]);

  if (loading) return <p>Loading match result...</p>;

  if (error) return <p className="text-red-600">Error: {error}</p>;

  if (!matchResult) return <p>No match result found.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Resume-Job Match Result</h2>
      <p><strong>Match Score:</strong> {matchResult.match_score}</p>
      <p><strong>Skills Score:</strong> {matchResult.score_skills}</p>
      <p><strong>Experience Score:</strong> {matchResult.score_experience}</p>
      <p><strong>Summary:</strong> {matchResult.summary}</p>
    </div>
  );
};

export default ResumeJobMatch;

