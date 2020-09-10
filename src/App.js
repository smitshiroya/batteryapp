import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { API, graphqlOperation } from 'aws-amplify'
import { listTodos } from './graphql/queries'
import { createTodo } from './graphql/mutations'
import { onCreateTodo } from './graphql/subscriptions'


class App extends Component {
  state = { name: '', description: '',company:'',chemistry:'', todos: [] }
  async componentDidMount() {
    try {
      const apiData = await API.graphql(graphqlOperation(listTodos))
      const todos = apiData.data.listTodos.items
      this.setState({ todos })
    } catch (err) {
      console.log('error: ', err)
    }
  }
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }
  createTodo = async () => {
    const { name, description, company, chemistry } = this.state
    if (name === '' || description === '' || company === '' || chemistry === '') return
    try {
      const todo = { name, description, company, chemistry }
      const todos = [...this.state.todos, todo]
      this.setState({ todos, name: '', description: '', company:'', chemistry:''})
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
      console.log('Battery successfully created!')
    } catch (err) {
      console.log('error: ', err)
    }
  }

  async componentDidMount() {
    this.subscription = API.graphql(
      graphqlOperation(onCreateTodo)
    ).subscribe({
      next: todoData => {
        const todo = todoData.value.data.onCreateTodo
        const todos = [
          ...this.state.todos.filter(r => {
            return (
              r.name !== todo.name && r.description !== todo.description && r.company != todo.company && r.chemistry != todo.chemistry
            )
          }),
          todo
        ]
        this.setState({ todos })
      }
    })
  }
  componentWillUnmount() {
    this.subscription.unsubscribe()
  }
  render() {
    return (
      <div className="App">
        <div style={styles.inputContainer}>
          <input
            name='name'
            placeholder='Battery name'
            onChange={this.onChange}
            value={this.state.name}
            style={styles.input}
          />
          <input
            name='description'
            placeholder='Battery description'
            onChange={this.onChange}
            value={this.state.description}
            style={styles.input}
          />
          <input
            name='company'
            placeholder='Company name'
            onChange={this.onChange}
            value={this.state.company}
            style={styles.input}
          />
          <input
            name='chemistry'
            placeholder='Chemistry'
            onChange={this.onChange}
            value={this.state.chemistry}
            style={styles.input}
          />
        </div>
        <button
          style={styles.button}
          onClick={this.createTodo}
        >Create Battery List</button>
        
        {
          this.state.todos.map((rest, i) => (
            <div key={i} style={styles.item}>
              <p style={styles.name}>{rest.name}</p>
              <p style={styles.description}>{rest.description}</p>
              <p style={styles.company}>{rest.company}</p>
              <p style={styles.chemistry}>{rest.chemistry}</p>
            </div>
          ))
        }
      </div>
    );
  }
}

const styles = {
  inputContainer: {
    margin: '0 auto', display: 'flex', flexDirection: 'column', width: 300
  },
  button: {
    border: 'none', backgroundColor: '#ddd', padding: '10px 30px'
  },
  input: {
    fontSize: 18,
    border: 'none',
    margin: 10,
    height: 35,
    backgroundColor: "#ddd",
    padding: 8
  },
  item: {
    padding: 10,
    borderBottom: '2px solid #ddd'
  },
  name: { fontSize: 22 },
  description: { color: 'rgba(0, 0, 0, .50)' },
  company: { color: 'rgba(0, 0, 0, .50)' },
  chemistry: { color: 'rgba(0, 0, 0, .50)' }
}

export default App