import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { thunkAnalyzeResume, clearAnalysis } from "../../redux/aiResumeAnalysis";
import "./ResumeAIAnalysis.css";

const ResumeAIAnalysis = () => {
  const { resumeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showJobPost, setShowJobPost] = useState(false);

  const analysis = useSelector((state) => state.aiResumeAnalysis.currentAnalysis);

  useEffect(() => {
    dispatch(clearAnalysis()); 
    dispatch(thunkAnalyzeResume(resumeId));
  }, [dispatch, resumeId]);

  const handleBack = () => {
    navigate("/resumes");
  };

  // Loading state
  if (!analysis) {
    return (
      <div className="analysis-page">
        <div className="analysis-container">
          <div className="loading-section">
            <h1 className="loading-title">We are analyzing...</h1>
            <p className="loading-subtitle">Please give us a moment...</p>
            
            {/* Progress bar */}
            <div className="progress-container">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        {/* Header */}
        <div className="analysis-header">
          <button onClick={handleBack} className="back-button">
            <svg className="back-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Go Back
          </button>
          <h1 className="page-title">Resume(S) Analyze Result</h1>
        </div>

        {/* Grid layout for dates */}
        <div className="dates-grid">
          {[
            ['08/01/2025', '3:45 PM'],
            ['07/21/2025', '2:45 PM'], 
            ['07/11/2025', '1:45 PM'],
            ['07/09/2025', '12:45 PM'],
            ['08/01/2024', '3:45 PM'],
            ['07/21/2024', '2:45 PM'],
            ['07/11/2024', '1:45 PM'],
            ['07/09/2024', '12:45 PM'],
            ['08/01/2023', '3:45 PM'],
            ['07/21/2023', '2:45 PM'],
            ['07/11/2023', '1:45 PM'],
            ['07/09/2023', '12:45 PM'],
            ['08/01/2022', '3:45 PM'],
            ['07/21/2022', '2:45 PM'],
            ['07/11/2022', '1:45 PM'],
            ['07/09/2022', '12:45 PM']
          ].map(([date, time], index) => (
            <div key={index} className="date-card">
              <div className="date-text">{date}</div>
              <div className="time-text">{time}</div>
            </div>
          ))}
        </div>

        {/* Analysis Details */}
        <div className="analysis-card">
          <div className="card-header">
            <h2 className="card-title">Resume(S) Analyze Details</h2>
            <button 
              onClick={() => setShowJobPost(true)}
              className="job-post-button"
            >
              View Pasted Job Post
            </button>
          </div>

          <div className="table-section">
            <h3 className="section-date">08/01/2025 3:45 PM</h3>
            
            {/* Table Header */}
            <div className="table-header">
              <div>Resume</div>
              <div>Analyze Score ▼</div>
              <div>Job Post Matched Percentage ▼</div>
              <div>Action</div>
            </div>

            {/* Sample resume row */}
            <div className="table-row">
              <div className="resume-name">CV-Simon-Tian-250125.pdf</div>
              <div className="score-value">{analysis.score_overall || '87'}</div>
              <div className="percentage-value">87%</div>
              <div>
                <button className="view-detail-button">View Detail</button>
              </div>
            </div>
          </div>

          {/* Analysis Results Section */}
          <div className="results-section">
            <h3 className="results-title">Analysis Results</h3>
            <p className="results-subtitle">
              AI analysis complete for 1 candidate | Job: Web Developer/React Native Developer
            </p>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">52%</div>
                <div className="stat-label">Average Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-number stat-green">1</div>
                <div className="stat-label">Strong Matches</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">87%</div>
                <div className="stat-label">Top Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-number stat-purple">1</div>
                <div className="stat-label">GitHub Profiles</div>
              </div>
            </div>

            {/* Export Button */}
            <div className="export-section">
              <button className="export-button">
                <svg className="export-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export Results
              </button>
            </div>

            {/* Candidate Details */}
            <div className="candidate-section">
              <div className="rank-icon">
                <svg className="trophy-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.242l3 2A1 1 0 0117 5v10a3 3 0 01-3 3H6a3 3 0 01-3-3V5a1 1 0 01.033-.758l3-2A1 1 0 017 2h5zm-1 9a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="rank-text">
                <div className="rank-label">Rank 1</div>
              </div>
              <div className="candidate-info">
                <div className="candidate-header">
                  <div className="candidate-details">
                    <h4 className="candidate-name">Simon Tian</h4>
                    <p className="candidate-email">jt886@cornell.edu</p>
                    <p className="candidate-file">CV-Simon-Tian-250125.pdf</p>
                  </div>
                  <button className="expand-button">
                    <span className="expand-text">▼ Expand</span>
                  </button>
                </div>
                <div className="candidate-scores">
                  <div className="score-item">
                    <div className="score-text">Overall: {analysis.score_overall || '87'}%</div>
                  </div>
                  <div className="score-item">
                    <div className="score-text">Skills: {analysis.score_skills || '70'}%</div>
                  </div>
                  <div className="score-item">
                    <div className="score-text">Experience: {analysis.score_experience || '70'}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          {analysis.strengths && (
            <div className="analysis-detail">
              <h3 className="detail-title">Strengths</h3>
              <p className="detail-text">{analysis.strengths}</p>
            </div>
          )}

          {analysis.weaknesses && (
            <div className="analysis-detail">
              <h3 className="detail-title">Weaknesses</h3>
              <p className="detail-text">{analysis.weaknesses}</p>
            </div>
          )}

          {analysis.suggestions && (
            <div className="analysis-detail">
              <h3 className="detail-title">Suggestions</h3>
              <p className="detail-text">{analysis.suggestions}</p>
            </div>
          )}
        </div>

        {/* Job Post Modal */}
        {showJobPost && (
          <div className="modal-overlay">
            <div className="modal-sidebar">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Pasted Job Post</h3>
                  <button
                    onClick={() => setShowJobPost(false)}
                    className="modal-close"
                  >
                    <svg className="close-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="modal-text">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut laoreet leo. Duis placerat consequat nulla ut auctor. Curabitur sem ipsum, efficitur id dui vitae, rhoncus ornare ex. Nulla mauris lacus, mollis ut est ac, sollicitudin volutpat quam. Ut non accumsan dolor. Vestibulum tempor in velit et ornare. Donec aliquet accumsan justo sit amet laoreet. Suspendisse vitae ipsum id nibh varius convallis non id diam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nam cursus elit nisl. Aliquam sed lobortis nulla. Donec eu consectetur leo. Pellentesque augue mauris, hendrerit a varius quis, varius eget erat. Aliquam posuere ipsum nec condimentum dictum. Suspendisse potenti. Integer quis pretium risus, sit amet viverra massa.
                  </p>
                  <p>
                    Quisque et blandit sem. Vestibulum ac tortor quis lacus mollis efficitur. Nulla sit amet nisl sed metus pellentesque auctor. Suspendisse ipsum enim, vestibulum nec placerat in, viverra vitae neque. Sed a rutrum quam, quis dignissim neque. In pellentesque tincidunt est id maximus. Integer non aliquam ipsum. Cras quis dictum arcu, eu suscipit diam. Vivamus commodo at sem eget sollicitudin. Sed convallis efficitur egestas. Duis hendrerit sem metus, at laoreet ex interdum ac. Phasellus scelerisque pretium massa id condimentum. Suspendisse potenti. Integer quis pretium risus, sit amet viverra massa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAIAnalysis;
