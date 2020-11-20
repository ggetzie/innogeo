import React, { Component } from 'react';
import axios from 'axios';

// const HKLongLat = [114.160486, 22.283262]

class SearchForm extends Component {
  constructor( props ) {
    super( props );
    this.state = { terms: '' };
    this.handleChange = this.handleChange.bind( this );
    this.handleSubmit = this.handleSubmit.bind( this );
  }

  handleChange( event ) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit( event ) {
    event.preventDefault();
    console.log( `Searching for ${this.state.terms}` );
    axios
      .get( 'https://1z85a4how2.execute-api.us-east-1.amazonaws.com/search_es', { params: { q: this.state.terms } })
      .then(( res ) => {
        console.log( res.data );
      });
  }

  render() {
    return (
      <div>
        <h2>Search</h2>
        <form onSubmit={this.handleSubmit}>
          <input type="text" value={this.state.terms} onChange={this.handleChange} name="terms" />
          <input type="submit" value="Search" />
        </form>
      </div>
    );
  }
}

export default SearchForm;
