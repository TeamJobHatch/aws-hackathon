import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkBatchMatchSelectedResumes, clearBatchMatchResults } from "../../redux/aiJobResumeScore";

const BatchResumeJobMatch = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const resumeIds = location.state?.resumeIds || [];
  const batchMatchResults = useSelector(state => state.jobResumeScore.batchMatchResults || []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId || resumeIds.length === 0) {
      setError("Missing jobId or resumeIds");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    dispatch(thunkBatchMatchSelectedResumes(jobId, resumeIds))
      .catch(err => setError(err.message || "Failed to fetch batch match results"))
      .finally(() => setLoading(false));

    return () => {
      dispatch(clearBatchMatchResults());
    };
  }, [dispatch, jobId, resumeIds]);

  // Optional: redirect back if missing params (e.g., refresh page)
  useEffect(() => {
    if (resumeIds.length === 0) {
      const timeout = setTimeout(() => {
        navigate(`/jobs/${jobId}/select_resumes_batch`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [resumeIds, navigate, jobId]);

  if (loading) return <p>Loading batch match results...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (batchMatchResults.length === 0) return <p>No batch match results found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6">Batch Resume-Job Match Results</h2>
      <ul>
        {batchMatchResults.map((result) => (
          <li key={result.resume_id} className="mb-4 p-4 border rounded">
            <p><strong>Resume ID:</strong> {result.resume_id}</p>
            {result.error ? (
              <p className="text-red-600">Error: {result.error}</p>
            ) : (
              <>
                <p><strong>Match Score:</strong> {result.match_score}</p>
                <p><strong>Skills Score:</strong> {result.score_skills}</p>
                <p><strong>Experience Score:</strong> {result.score_experience}</p>
                <p><strong>Summary:</strong> {result.summary}</p>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BatchResumeJobMatch;


