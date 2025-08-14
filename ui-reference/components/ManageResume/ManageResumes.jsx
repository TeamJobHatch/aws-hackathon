import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link,useNavigate } from "react-router-dom";
import {
  thunkFetchResumes,
  thunkDeleteResume
} from "../../redux/resumes";
import "./ManageResumes.css";

const ManageResumes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const resumes = useSelector(state => Object.values(state.resumes));

  useEffect(() => {
    dispatch(thunkFetchResumes());
  }, [dispatch]);

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm("Are you sure you want to delete this resume?");
    if (confirmed) {
      await dispatch(thunkDeleteResume(resumeId));
    }
  };

  const handleAiScore = (resumeId) => {
    navigate(`/resumes/${resumeId}/ai-score`);
  };

  return (
    <div className="manage-page">
      <div className="manage-container">
        <div className="manage-header">
          <h1 className="manage-title">Your Resumes</h1>
          <Link to="/resumes/new" className="new-item-button">
            + New Resume
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">No resumes uploaded yet.</p>
          </div>
        ) : (
          <div className="items-list">
            {resumes.map(resume => (
              <div key={resume.id} className="item-card">
                <div className="item-content">
                  <a
                    href={resume.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="item-title"
                  >
                    {resume.file_name}
                  </a>
                  <p className="item-date">
                    Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="item-actions">
                  <Link to={`/resumes/${resume.id}/edit`}>
                    <button className="edit-button">
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleAiScore(resume.id)}
                    className="primary-action-button"
                  >
                    AI Score
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageResumes;

