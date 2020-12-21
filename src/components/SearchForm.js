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
    for (let k in this.state) {
      console.log(k);
      this.setState({[k]: ""});
    }
  }

  handleSubmit( event ) {
    event.preventDefault();
    this.props.setLoading();
    let must_items = [];
    let filter_items = [];
    if (this.state.terms) {
      must_items.push({
        multi_match: {
          query: this.state.terms,
          fields: ["paper_title", "fields_of_study.fos_name"]
        }
      });
    }
    if (this.state.author) {
      must_items.push({match: {"authors.author_name": this.state.author}});
    }
    if (this.state.minYear && this.state.maxYear) {
      filter_items = [{range: {year: {gte: this.state.minYear, lte:this.state.maxYear}}}]
    }
    const query = {
      bool: {
        must: must_items,
        filter: filter_items
      }
    }
    console.log("sending query");
    console.log(query);
    // const query = {
    //   bool: {
    //     must: [
    //       { term: {"paper_title": this.state.terms}},
    //       { term: {"fos_name": this.state.terms}},
    //       { term: {"author_name": this.state.author}}
    //     ],
    //     filter: [
    //       {range: {year: {gte: this.state.minYear, lte: this.state.maxYear}}}
    //     ]
    //   }
    // };
     
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
          <label htmlFor="terms">Keywords</label>
          <input className="form-control" type="text" value={this.state.terms} onChange={this.handleChange} name="terms" />
        </div>
        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input className="form-control" type="text" value={this.state.author} onChange={this.handleChange} name="author" />
        </div>
        <p>Search for papers published between:</p>
        <div className="form-row">
          <div className="form-group col">
            <label htmlFor="minYear">Start Year</label>
            <input className="form-control" type="number" value={this.state.minYear} onChange={this.handleChange} name="minYear" />
          </div>
          <div className="form-group col">
            <label htmlFor="maxYear">End Year</label>
            <input className="form-control" type="number" value={this.state.maxYear} onChange={this.handleChange} name="maxYear" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input className="form-control" type="text" value={this.state.text} onChange={this.handleChange} name="city"/>
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
