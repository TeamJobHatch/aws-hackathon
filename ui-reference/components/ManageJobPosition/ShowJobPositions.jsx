import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import {
  thunkDeleteJob,
  thunkFetchAllJobs,
} from '../../redux/jobPositions';
import "./ShowJobPositions.css";

const ShowJobPositions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const jobs = useSelector((state) => Object.values(state.jobs));

  useEffect(() => {
    dispatch(thunkFetchAllJobs());
  }, [dispatch]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this job?");
    if (confirmed) {
      await dispatch(thunkDeleteJob(id));
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-container">
        <div className="manage-header">
          <h1 className="manage-title">Your Job Positions</h1>
          <Link to="/joblist/new" className="new-item-button">
            + New Job
          </Link>
        </div>
        
        <div className="items-list">
          {jobs.length === 0 && (
            <div className="empty-state">
              <p className="empty-message">No jobs found. Create one!</p>
            </div>
          )}
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-content">
                <Link
                  to={`/joblist/${job.id}`}
                  className="job-title"
                >
                  {job.title}
                </Link>
                <p className="job-description">{job.description}</p>
                <div className="job-meta">
                  <span className="job-date">
                    Created: {new Date(job.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="job-actions">
                <button
                  onClick={() => navigate(`/joblist/edit/${job.id}`)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/jobs/${job.id}/resumes/select`)}
                  className="primary-action-button"
                >
                  Match Resumes
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowJobPositions;

