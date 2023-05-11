import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const GET_TODOS = gql`
  query getTodos {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
    update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation addTodo($text: String!) {
    insert_todos(objects: { text: $text }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation deleteTodos($id: uuid!) {
    delete_todos(where: { id: { _eq: $id } }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

function App() {
  const [todoText, setTodoText] = useState('');
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText('')
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <div>Error fething todos</div>;

  const handleToggleTodo = (todo) => {
    toggleTodo({
      variables: { id: todo.id, done: !todo.done }
    });
  };

  const addTodoHandler = (e) => {
    e.preventDefault();
    if (!todoText.trim()) return;

    addTodo({
      variables: { text: todoText },
      refetchQueries: [{ query: GET_TODOS }]
    });
  };

  const deleteHandler = (id) => {
    const isConfirmed = window.confirm('Do you want to delete this todo?');
    if (isConfirmed) {
      deleteTodo({
        variables: { id },
        update: (cache) => {
          const prevData = cache.readQuery({ query: GET_TODOS });
          const newTodos = prevData.todos.filter((todo) => todo.id !== id);
          cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } });
        }
      });
    }
  };

  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
      <h1 className="f2-l">
        GraphQL Checklist{' '}
        <span
          role="img"
          aria-label="Checkmark"
        >
          ✔
        </span>
      </h1>
      {/* Todo Form */}
      <form
        className="mb3"
        onSubmit={addTodoHandler}
      >
        <input
          className="pa2 f4 b--dashed"
          type="text"
          placeholder="Write your todo"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
        />
        <button
          className="pa2 f4 bg-green"
          type="submit"
        >
          Create
        </button>
      </form>
      {/* Todo List */}
      <div className="flex-items-center justify-center flex-column">
        {data.todos.map((todo) => (
          <p
            onClick={() => handleToggleTodo(todo)}
            key={todo.id}
          >
            <span className={`pointer list pa1 f3 ${todo.done && 'strike'}`}>
              {todo.text}
            </span>
            <button
              className="bg-transparent bn f4 red"
              onClick={() => deleteHandler(todo.id)}
            >
              &times;
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
