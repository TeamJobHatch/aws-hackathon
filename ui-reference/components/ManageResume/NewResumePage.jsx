import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkUploadResumes } from "../../redux/resumes";
import "./NewResumePage.css";

const NewResumePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [step, setStep] = useState(1); // 1: upload, 2: job post, 3: analyzing
  const [jobPost, setJobPost] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleNext = async () => {
    if (step === 1 && files.length > 0) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      setIsUploading(true);
      setUploadError(null);
      
      try {
        // Create FormData to send files
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('file', file);  // Backend expects 'file' not 'files'
        });

        // Upload resumes using the existing thunk
        const result = await dispatch(thunkUploadResumes(formData));
        
        if (!result) {
          // Upload successful (thunk returns null on success)
          // Since we don't get the resume ID back directly, navigate to resumes list
          setTimeout(() => {
            navigate("/resumes");
          }, 2000);
        } else {
          // Upload failed (thunk returns error data)
          setUploadError(result?.error || 'Upload failed. Please try again.');
          setStep(2); // Go back to step 2 on error
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Upload failed. Please try again.');
        setStep(2); // Go back to step 2 on error
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleNext();
  };

  // Remove a file from the list by its index
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Step 1: Upload Resumes
  if (step === 1) {
    return (
      <div className="upload-page">
        <div className="upload-container">
          <div className="upload-content">
            {/* Header */}
            <div className="upload-header">
              <h1 className="upload-title">Upload Resume(s)</h1>
              <p className="upload-subtitle">Please upload up to 5 resumes for us to analyze</p>
            </div>

            {/* Upload Card */}
            <div className="upload-card">
              <form onSubmit={handleSubmit}>
                {/* File Upload Area */}
                {files.length === 0 ? (
                  <div className="upload-dropzone">
                    <div className="upload-icon-container">
                      <svg className="upload-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="upload-info">Each file size limited 10 MB, only Docx and PDF type are allowed</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files);
                        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
                        e.target.value = null;
                      }}
                      className="upload-input"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="upload-label"
                    >
                      Click to upload or drag and drop
                    </label>
                  </div>
                ) : (
                  /* Selected Files Display */
                  <div className="files-list">
                    <div className="files-container">
                      {files.map((file, idx) => (
                        <div key={idx} className="file-item">
                          <div className="file-info">
                            <svg className="file-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="file-name">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => removeFile(idx)}
                          >
                            <svg className="remove-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="upload-actions">
                  {files.length > 0 ? (
                    <div className="button-group">
                      <button
                        type="button"
                        onClick={() => setFiles([])}
                        className="back-button"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="next-button"
                      >
                        Next
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="next-button-disabled"
                      disabled
                    >
                      Next
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Job Post Input
  if (step === 2) {
    return (
      <div className="upload-page">
        <div className="upload-container">
          <div className="upload-content">
            {/* Header */}
            <div className="upload-header">
              <h1 className="upload-title">Job Post</h1>
              <p className="upload-subtitle">Please paste your Job Post details below</p>
            </div>

            {/* Job Post Card */}
            <div className="upload-card">
              {uploadError && (
                <div className="error-message">
                  {uploadError}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="job-post-section">
                  <textarea
                    className="job-post-textarea"
                    value={jobPost}
                    onChange={(e) => setJobPost(e.target.value)}
                    placeholder="Paste job description here..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="button-group">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="back-button"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={jobPost.trim() ? "next-button" : "next-button-disabled"}
                    disabled={!jobPost.trim()}
                  >
                    Next
                  </button>
                </div>

                <div className="skip-section">
                  <button
                    type="button"
                    onClick={() => handleNext()}
                    className="skip-button"
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Analyzing
  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-content">
          <div className="analyzing-section">
            <h1 className="upload-title">
              {isUploading ? "Uploading resumes..." : "We are analyzing..."}
            </h1>
            <p className="analyzing-subtitle">
              {isUploading ? "Please wait while we upload your files..." : "Please give us a moment..."}
            </p>
            
            {/* Progress bar */}
            <div className="progress-container">
              <div className="progress-bar"></div>
            </div>
            
            {/* File count info */}
            <p className="upload-info-text">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewResumePage;


