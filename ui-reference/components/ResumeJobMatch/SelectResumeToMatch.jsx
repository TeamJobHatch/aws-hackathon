import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkFetchResumes } from "../../redux/resumes";

const SelectResumeToMatch = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get all resumes from redux store and convert to array
  const resumesObj = useSelector(state => state.resumes);
  const resumes = Object.values(resumesObj || {});

  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [error, setError] = useState("");

  // Fetch resumes on mount
  useEffect(() => {
    dispatch(thunkFetchResumes())
      .catch(() => setError("Failed to load resumes"));
  }, [dispatch]);

  // Confirm selection and navigate to match page
  const handleConfirm = () => {
    if (!selectedResumeId) {
      alert("Please select a resume first.");
      return;
    }
    navigate(`/jobs/${jobId}/resumes/${selectedResumeId}/match`);
  };

  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-6">Select a Resume to Match</h2>
      <ul className="mb-6">
        {resumes.length === 0 && <li>No resumes found.</li>}
        {resumes.map((resume) => (
          <li
            key={resume.id}
            className={`cursor-pointer p-3 mb-2 border rounded ${
              selectedResumeId === resume.id
                ? "bg-blue-200 border-blue-600"
                : "border-gray-300"
            }`}
            onClick={() => setSelectedResumeId(resume.id)}
          >
            <div>
              <strong>ID:</strong> {resume.id}
            </div>
            <div>
              <strong>File Name:</strong> {resume.file_name || "Unnamed Resume"}
            </div>
            <div>
              <strong>URL:</strong>{" "}
              <a
                href={resume.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
                onClick={e => e.stopPropagation()} // prevent li click on link click
              >
                {resume.file_url}
              </a>
            </div>
          </li>
        ))}
      </ul>

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        onClick={handleConfirm}
      >
        Confirm and Match
      </button>
    </div>
  );
};

export default SelectResumeToMatch;


