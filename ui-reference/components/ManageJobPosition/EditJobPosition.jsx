
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchOneJob, thunkUpdateJob } from "../../redux/jobPositions";

const EditJobPosition = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const job = useSelector(state => state.jobs[id]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      if (!job) {
        const fetchedJob = await dispatch(thunkFetchOneJob(id));
        if (fetchedJob?.title) {
          setTitle(fetchedJob.title);
          setDescription(fetchedJob.description);
        }
      } else {
        setTitle(job.title);
        setDescription(job.description);
      }
    };
    fetchJob();
  }, [dispatch, id, job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(thunkUpdateJob(id, { title, description }));
    if (!result) {
      navigate("/joblist");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Edit Job Position</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job Title"
          required
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Job Description"
          rows={5}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditJobPosition;

