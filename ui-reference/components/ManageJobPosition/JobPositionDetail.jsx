import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { thunkFetchOneJob } from '../../redux/jobPositions';

const JobPositionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      const res = await dispatch(thunkFetchOneJob(id));
      if (res?.error) {
        setError("Job not found or you are not authorized.");
      } else {
        setJob(res);
      }
    };
    loadJob();
  }, [dispatch, id]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 text-gray-500 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
        <p className="text-gray-600 text-sm mb-4">
          Created at: {new Date(job.created_at).toLocaleString()}
        </p>
        <p className="text-gray-800 whitespace-pre-line">{job.description}</p>
      </div>
      <div className="flex gap-3 mb-6">
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={() => navigate(`/joblist/edit/${job.id}`)}
        >
          Edit
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          onClick={() => navigate("/joblist")}
        >
          Back to Jobs
        </button>
      </div>

      {/* New buttons section */}
      <div className="flex gap-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => {
            // Navigate to single resume selection page for this job.
            // After selecting a resume, user will be redirected to the match result page.
            navigate(`/jobs/${job.id}/resumes/select`);
          }}
        >
          Select Resume to Match
        </button>

        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          onClick={() => {
            // Navigate to batch resume selection page for this job,
            // allowing multiple resumes to be selected for batch matching.
            navigate(`/jobs/${job.id}/select_resumes_batch`);
          }}
        >
          Batch Match Multiple Resumes
        </button>
      </div>
    </div>
  );
};

export default JobPositionDetail;

