import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkUpdateResume,
  thunkFetchResumes
} from "../../redux/resumes";
import "./EditResumePage.css";

const EditResumePage = () => {
  const { resumeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const resume = useSelector(state => state.resumes[resumeId]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!resume) {
      dispatch(thunkFetchResumes());
    } else {
      setName(resume.file_name || "");
    }
  }, [resume, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file_name", name);

    const res = await dispatch(thunkUpdateResume(resumeId, formData));
    if (!res) {
      navigate("/resumes");
    } else {
      alert("Update failed: " + JSON.stringify(res));
    }
  };

  if (!resume)
    return (
      <div className="edit-page">
        <div className="loading-container">
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="edit-page">
      <div className="edit-container">
        <div className="edit-content">
          <div className="edit-card">
            <div className="edit-header">
              <h2 className="edit-title">Edit Resume Name</h2>
            </div>

            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label">Resume Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditResumePage;
