import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchResults } from '../actions/resultActions';
import { setLoading } from '../actions/loadingActions'
import PropTypes from 'prop-types';



class SearchForm extends Component {
  constructor( props ) {
    super( props );
    this.state = { 
      terms: '' ,
      author: '',
    };
    this.handleChange = this.handleChange.bind( this );
    this.handleSubmit = this.handleSubmit.bind( this );
    this.clearForm = this.clearForm.bind( this );
  }

  handleChange( event ) {
    this.setState({ [event.target.name]: event.target.value });
  }

  clearForm( event ) {
    event.preventDefault();
    console.log("clearing form")
    console.log(this.state)
    for (let k in this.state) {
      console.log(k);
      this.setState({[k]: ""});
    }
  }

  handleSubmit( event ) {
    event.preventDefault();
    console.log( `Searching for ${this.state.terms}` );
    this.props.setLoading();
    const query = {
      q: this.state.terms
    };
    this.props.fetchResults(query)

  }

  render() {
    let content;
    if (this.props.loading) {
      content = <div className="spinner"></div>
    } else {
      content = (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label for="terms">Keywords</label>
          <input className="form-control" type="text" value={this.state.terms} onChange={this.handleChange} name="terms" />
        </div>
        <div className="form-row">
          <div className="form-group col">
            <label for="author">Author</label>
            <input className="form-control" type="text" value={this.state.author} onChange={this.handleChange} name="author" />
          </div>
          <div className="form-group col">
            <label for="year">Year</label>
            <input className="form-control" type="number" value={this.state.year} onChange={this.handleChange} name="year" />
          </div>
        </div>
        <div className="d-flex flex-row-reverse">
          <input className="btn btn-primary" type="submit" value="Submit" />
          <button className="btn btn-secondary mr-2" role="button" onClick={this.clearForm}>Clear</button>
        </div>
      </form>
      )
    }
    
    return (
      <div className="search-form">
        <h2 className="mt-2">Search</h2>
        <p>
          Use the form below to search over 70M scholarly papers and display collaboration relationships on the map.
        </p>
          {content}
      </div>
    );
  }
}

function mapStateToProps(state) {
  console.log("mapping state")
  console.log(state)
  const res = {
    loading: state.results.loading
  }
  return res;
}

SearchForm.propTypes = {
  fetchResults: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {fetchResults, setLoading})(SearchForm);
