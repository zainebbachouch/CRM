import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Autocomplete from 'react-autocomplete';

function AddTask({ selectedTask, fetchTasks, tasks, setTasks }) {
  const [loading, setLoading] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [formData, setFormData] = useState({
    idEmploye: '',
    title: '',
    deadline: '',
    priorite: '',
    statut: '',
    messageTache: ''
  });
  const [errors, setErrors] = useState({
    idEmploye: '',
    title: '',
    deadline: '',
    priorite: '',
    statut: '',
    messageTache: '',
    general: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
  }, [token]);

  useEffect(() => {
    if (selectedTask) {
      try {
        const parsedContent = JSON.parse(selectedTask.messageTache);
        setEditorState(EditorState.createWithContent(convertFromRaw(parsedContent)));
        setFormData({
          idEmploye: selectedTask.idEmploye,
          title: selectedTask.title,
          deadline: selectedTask.deadline,
          priorite: selectedTask.priorite,
          statut: selectedTask.statut,
          messageTache: selectedTask.messageTache
        });
      } catch (error) {
        console.error("Invalid JSON in messageTache:", error);
      }
    }
  }, [selectedTask]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/employees', config);
        setEmployees(response.data);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    if (role !== 'employe') {
      fetchEmployees();
    }
  }, [config, role]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    const rawContentState = convertToRaw(state.getCurrentContent());
    setFormData({ ...formData, messageTache: JSON.stringify(rawContentState) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (val) => {
    const selected = employees.find((employee) => employee.idemploye.toString() === val);
    if (selected) {
      setSearchTerm('');
      setSelectedEmployees([...selectedEmployees, selected.idemploye]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const data = {
        idEmployes: selectedEmployees,
        title: formData.title,
        deadline: formData.deadline,
        priorite: formData.priorite,
        statut: formData.statut,
        messageTache: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      };

      let response;
      if (selectedTask) {
        response = await axios.put(`http://127.0.0.1:5000/api/updateTask/${selectedTask.id}`, data, config);
      } else {
        response = await axios.post('http://127.0.0.1:5000/api/createTask', data, config);
      }

      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setSuccessMessage(response.data.message || 'Task operation successful.');
        setTasks([]);
        setFormData({
          idEmploye: '',
          title: '',
          deadline: '',
          priorite: '',
          statut: '',
          messageTache: ''
        });
        setSelectedEmployees([]);
        document.getElementById("closeButton").click();
        fetchTasks();
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        console.error('Server response:', err.response);
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'An error occurred. Please try again later.' });
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="modal fade h-80 v-80" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">{selectedTask ? 'Update Task' : 'Add New Task'}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            <form id="taskForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="employees">Employees:</label>
                <Autocomplete
                  getItemValue={(item) => item.idemploye.toString()}
                  items={employees.filter((employee) =>
                    `${employee.nom_employe} ${employee.prenom_employe}`.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  renderItem={(item, isHighlighted) => (
                    <div key={item.idemploye} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                      {item.nom_employe} {item.prenom_employe}
                    </div>
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSelect={handleSelect}
                  inputProps={{ className: 'form-control' }}
                />
                <div>
                  {selectedEmployees.map((idEmploye, index) => {
                    const employee = employees.find((emp) => emp.idemploye === idEmploye);
                    return (
                      <div key={index}>
                        {employee.nom_employe} {employee.prenom_employe}
                        <button type="button" onClick={() => setSelectedEmployees(selectedEmployees.filter(id => id !== idEmploye))}>
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="row">
                <div className="form-group col">
                  <label htmlFor="deadline">Deadline:</label>
                  <input
                    type="date"
                    className="form-control"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="messageTache">Description:</label>
                <div className="editor-container">
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={handleEditorChange}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    toolbar={{
                      options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
                      inline: { inDropdown: false, options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
                      blockType: { inDropdown: true },
                      fontSize: { inDropdown: true },
                      list: { inDropdown: true, options: ['unordered', 'ordered'] },
                      textAlign: { inDropdown: true, options: ['left', 'center', 'right', 'justify'] },
                      colorPicker: { inDropdown: true },
                      link: { inDropdown: true },
                      embedded: { inDropdown: true },
                      emoji: { inDropdown: false },
                      image: { inDropdown: true },
                      remove: { inDropdown: true },
                      history: { inDropdown: true },
                    }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="priorite">Priority:</label>
                <select
                  className="form-control"
                  id="priorite"
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="urgence">Urgent</option>
                  <option value="importance">Important</option>
                  <option value="routine">Routine</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="statut">Status:</label>
                <select
                  className="form-control"
                  id="statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="To-Do">To Do</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {selectedTask ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button id="closeButton" type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTask;
