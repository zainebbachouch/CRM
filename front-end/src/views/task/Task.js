import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { format } from 'date-fns';



function Task() {
  const token = localStorage.getItem('token');

  const [tasks, setTasks] = useState({

  });

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/getAllTasks', config);
      const tasksByStatus = {
        "To-Do": [],
        "In-Progress": [],
        "Done": []
      };

      response.data.forEach(task => {
        tasksByStatus[task.statut].push(task);
      });

      console.log('Fetched tasks:', tasksByStatus);
      setTasks(tasksByStatus);

    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  }, [config]);

  useEffect(() => {
    fetchTasks(); // Fetch tasks when component mounts
  }, [fetchTasks]); // Depend on fetchTasks to avoid infinite loop

  const handleOnDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    console.log('Drag result:', result);

    if (!destination) return;

    const updatedTasks = { ...tasks };
    const sourceList = Array.from(updatedTasks[source.droppableId]);
    const destinationList = Array.from(updatedTasks[destination.droppableId]);

    const [movedTask] = sourceList.splice(source.index, 1);

    movedTask.statut = destination.droppableId;
    destinationList.splice(destination.index, 0, movedTask);

    updatedTasks[source.droppableId] = sourceList;
    updatedTasks[destination.droppableId] = destinationList;

    setTasks(updatedTasks);

    try {
      const formattedDeadline = format(movedTask.deadline, 'yyyy-MM-dd HH:mm:ss');
      const response = await axios.put(      
        `http://127.0.0.1:5000/api/updateTask/${draggableId}`,   
        {      
          messageTache: movedTask.messageTache,      
          deadline: formattedDeadline,      
          statut: movedTask.statut,      
          priorite: movedTask.priorite      
        },      
        config      
      );
      
            console.log('Task status updated:', response.data);
    } catch (error) {
      console.error('Error updating task status:', error.response ? error.response.data : error.message);
    }
  };

  console.log('Rendering Task component with state:', tasks);

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="columns-container d-flex flex-wrap">
            {Object.keys(tasks).map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="column"
                  >
                    <h2>{status.replace('-', ' ')}</h2>
                    {tasks[status].map((task, taskIndex) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={taskIndex}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-item"
                          >
                            <p>ID: {task.id}</p>
                            <p>Employé ID: {task.idEmploye}</p>
                            <p>Message: {task.messageTache}</p>
                            <p>Deadline: {task.deadline}</p>
                            <p>Statut: {task.statut}</p>
                            <p>Priorité: {task.priorite}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Task;
