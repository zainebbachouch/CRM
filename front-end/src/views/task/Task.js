import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { format } from 'date-fns';
import orderBy from 'lodash/orderBy';
import AddTask from './AddTask';




function Task() {
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);


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
    fetchTasks();
  }, [fetchTasks]);


  const handleOnDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    console.log('Drag result:', result);

    try {
      // Deep clone the tasks to avoid direct state mutation
      const updatedTasks = JSON.parse(JSON.stringify(tasks));
      console.log('Initial cloned tasks:', updatedTasks);

      const sourceList = updatedTasks[source.droppableId];
      const destinationList = updatedTasks[destination.droppableId];

      // Remove the task from the source list
      const [movedTask] = sourceList.splice(source.index, 1);
      console.log('Moved task:', movedTask);

      // Update the task's status if it was moved to a different column
      if (source.droppableId !== destination.droppableId) {
        movedTask.statut = destination.droppableId;
      }

      // Insert the task into the destination list at the specified index
      destinationList.splice(destination.index, 0, movedTask);
      console.log('Updated destination list:', destinationList);

      // Update the order of tasks in the source list
      sourceList.forEach((task, index) => {
        task.order = index;
      });
      console.log('Updated source list:', sourceList);

      // Update the order of tasks in the destination list
      destinationList.forEach((task, index) => {
        task.order = index;
      });

      console.log('Updated tasks:', updatedTasks);
      // Set the updated tasks in state
      setTasks(updatedTasks);

      // Prepare data for PUT request for single task
      const formattedDeadline = format(new Date(movedTask.deadline), 'yyyy-MM-dd HH:mm:ss');
      const putData = {
        messageTache: movedTask.messageTache,
        deadline: formattedDeadline,
        statut: movedTask.statut,
        priorite: movedTask.priorite,
        order: movedTask.order
      };

      console.log('PUT data for single task:', putData);
      // Update the single task
      await axios.put(
        `http://127.0.0.1:5000/api/updateTask/${draggableId}`,
        putData,
        config
      );

      // Prepare data for updating order of all tasks
      const updateOrderData = [
        ...sourceList.map((task) => ({ id: task.id, order: task.order })),
        ...destinationList.map((task) => ({ id: task.id, order: task.order }))
      ];

      console.log('PUT data for order update:', updateOrderData);
      // Update the order of all tasks in the affected columns
      await axios.put(
        `http://127.0.0.1:5000/api/updateTasksOrder`,
        { tasks: updateOrderData },
        config
      );

      console.log('Task status and order updated successfully');

    } catch (error) {
      console.error('Error updating task status and order:', error);
      fetchTasks(); // Re-fetch tasks to revert to the previous state on error
    }
  };

  const handleUpdate = (task, action) => {
    if (action === "update") {
      setSelectedTask(task);
    }
  };

  const parseMessageTache = (messageTache) => {
    try {
      const parsedData = JSON.parse(messageTache);
      return parsedData.blocks.map(block => block.text).join(' ');
    } catch (error) {
      console.error('Invalid JSON in messageTache:', error);
      return '';
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.slice(0, 10);
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        {/* Button to open add task modal */}
        <button className="btn btn-success mr-2" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => handleUpdate('val', 'ajouter')}>
          Add Task
        </button>

        {/* AddTask modal */}
        <AddTask
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          fetchTasks={fetchTasks}
          tasks={tasks}
          setTasks={setTasks}
        />
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
                    {orderBy(tasks[status], ['order'], ['asc']).map((task, taskIndex) => (
                      <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={taskIndex}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-item"
                          >
                            <p>ID: {task.id}</p>
                            <p>Employé: {task.nom_employe} {task.prenom_employe}</p>
                            {console.log("Nom et prénom:", task.nom_employe, task.prenom_employe)}

                            <p>Title: {task.title}</p>
                            <p>Message: {parseMessageTache(task.messageTache)}</p>
                            <p>Deadline: {formatDate(task.deadline)}</p>
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
