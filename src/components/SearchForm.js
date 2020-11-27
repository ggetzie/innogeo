import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchResults } from '../actions/resultActions';
import { setLoading } from '../actions/loadingActions'
import PropTypes from 'prop-types';



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
      content = (<form onSubmit={this.handleSubmit}>
                        <input type="text" value={this.state.terms} onChange={this.handleChange} name="terms" />
                        <input type="submit" value="Submit" />
                      </form>)
    }
    
    return (
      <div className="search-form">
        <h2>Search</h2>
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
