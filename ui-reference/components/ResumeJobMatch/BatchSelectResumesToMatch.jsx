import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { thunkFetchResumes } from "../../redux/resumes";

const BatchSelectResumesToMatch = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resumesObj = useSelector(state => state.resumes);
  const resumes = Object.values(resumesObj || {});

  const [selectedResumeIds, setSelectedResumeIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(thunkFetchResumes())
      .catch(() => setError("Failed to load resumes"));
  }, [dispatch]);

  const toggleSelect = (id) => {
    setSelectedResumeIds(prev =>
      prev.includes(id)
        ? prev.filter(rid => rid !== id)
        : [...prev, id]
    );
  };

  const handleBatchMatch = () => {
    if (selectedResumeIds.length === 0) {
      alert("Please select at least one resume.");
      return;
    }

    navigate(`/jobs/${jobId}/resumes/match_batch_results`, {
      state: { resumeIds: selectedResumeIds }
    });
  };

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-6">Batch Select Resumes to Match</h2>
      <ul className="mb-6">
        {resumes.length === 0 && <li>No resumes found.</li>}
        {resumes.map(resume => (
          <li
            key={resume.id}
            onClick={() => toggleSelect(resume.id)}
            className={`cursor-pointer p-3 mb-2 border rounded select-none ${
              selectedResumeIds.includes(resume.id)
                ? "bg-green-200 border-green-600"
                : "border-gray-300"
            }`}
          >
            <div><strong>{resume.title || `Resume #${resume.id}`}</strong></div>
            <div className="text-sm text-gray-600">{resume.file_url}</div>
          </li>
        ))}
      </ul>

      <button
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
        onClick={handleBatchMatch}
      >
        Confirm Batch Match ({selectedResumeIds.length})
      </button>
    </div>
  );
};

export default BatchSelectResumesToMatch;

