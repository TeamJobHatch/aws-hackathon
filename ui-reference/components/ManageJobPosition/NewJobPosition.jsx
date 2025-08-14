import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkCreateJob } from '../../redux/jobPositions';

const NewJobPosition = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(thunkCreateJob({ title, description }));
    if (res) setErrors(res);
    else navigate('/joblist');
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#fff7e8' }}>
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Job Position</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter job title"
                required
              />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-40"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed job description, requirements, and qualifications..."
              ></textarea>
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/joblist')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                style={{ backgroundColor: '#EA580C' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#EA580C'}
              >
                Create Job Position
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewJobPosition;
