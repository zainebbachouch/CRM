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
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

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

  useEffect(() => {
    if (selectedTask) {
      const parsedContent = JSON.parse(selectedTask.messageTache);
      setEditorState(EditorState.createWithContent(convertFromRaw(parsedContent)));

      console.log('Selected Task:', selectedTask); // Log task details
      setFormData({
        id: selectedTask.id,
        title: selectedTask.title,
        deadline: selectedTask.deadline,
        priorite: selectedTask.priorite,
        statut: selectedTask.statut,
        messageTache: selectedTask.messageTache
      });

      // Set selected employees from the task (assuming `employe_names` is a string of names)
      const employeeIds = selectedTask.employe_names.split(',').map(name => {
        const emp = employees.find(emp => `${emp.nom_employe} ${emp.prenom_employe}` === name.trim());
        return emp ? emp.idemploye : null;
      }).filter(id => id);

      setSelectedEmployees(employeeIds);
      setSearchTerm(''); // Reset search term on task load
    } else {
      // Reset form data when no task is selected
      setFormData({
        id: '',
        title: '',
        deadline: '',
        priorite: '',
        statut: '',
        messageTache: ''
      });
      setEditorState(EditorState.createEmpty());
      setSelectedEmployees([]);
      setSearchTerm('');
    }
  }, [selectedTask, employees]);


  const handleRemoveEmployee = (idEmploye) => {
    setSelectedEmployees(selectedEmployees.filter((id) => id !== idEmploye));
  };

  const handleEditorChange = (state) => {
    setEditorState(state);
    const rawContentState = convertToRaw(state.getCurrentContent());
    setFormData({ ...formData, messageTache: JSON.stringify(rawContentState) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (value) => {
    const selectedEmp = employees.find(emp => emp.idemploye.toString() === value);
    if (selectedEmp && !selectedEmployees.includes(selectedEmp.idemploye)) {
      setSelectedEmployees([...selectedEmployees, selectedEmp.idemploye]);
      setSearchTerm(''); // Clear search term after selection
    } else if (selectedEmp && selectedEmployees.includes(selectedEmp.idemploye)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== selectedEmp.idemploye));
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
                  {selectedEmployees.map((idEmploye) => {
                    const employee = employees.find((emp) => emp.idemploye === idEmploye);
                    return (
                      <div key={idEmploye} style={{ marginTop: '5px' }}>
                        {employee ? `${employee.nom_employe} ${employee.prenom_employe}` : 'Employee not found'}
                        <button type="button" className="btn btn-danger btn-sm ml-2" onClick={() => handleRemoveEmployee(idEmploye)}>
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="deadline">Deadline:</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="priorite">Priority:</label>
                <select className="form-control" id="priorite" name="priorite" value={formData.priorite} onChange={handleChange} required>
                  <option value="">Select Priority</option>
                  <option value="urgence">Urgent</option>
                  <option value="importance">Important</option>
                  <option value="routine">Routine</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="statut">Status:</label>
                <select className="form-control" id="statut" name="statut" value={formData.statut} onChange={handleChange} required>
                  <option value="">Select Status</option>
                  <option value="To-Do">To-Do</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="messageTache">Task Message:</label>
                <Editor
                  editorState={editorState}
                  onEditorStateChange={handleEditorChange}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Task'}
              </button>
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
