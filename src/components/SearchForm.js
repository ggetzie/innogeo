import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchResults } from '../actions/resultActions';
import { setLoading } from '../actions/loadingActions'
import PropTypes from 'prop-types';
import axios from 'axios';
import { debounce } from "lodash";

const ES_URL = 'https://1z85a4how2.execute-api.us-east-1.amazonaws.com/search_es'
const DEBOUNCE_DELAY = 500;

class CitySearch extends Component {
  constructor (props) {
    super(props);
    this.state = {
      value: "",
      cities: [],
      selected: {name: ""},
      isLoading: false,
      error: {
        status: false,
        message: ""
      }
    }
    this.delayedCallback = debounce(this.fetchItems, DEBOUNCE_DELAY);
    this.handleChange = this.handleChange.bind(this);
    this.fetchItems = this.fetchItems.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getCity = this.getCity.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value})
    if (event.target.value.length > 2) {
      this.delayedCallback();
    } else {
      this.setState({cities: []})
    }
  }

  fetchItems = async () => {
    const value = this.state.value;
    const { onChange } = this.props;
    this.setState({isLoading: true});

    try {
      const data = {
        size: 10,
        query: {
          multi_match: {
            query: value,
            type: "bool_prefix",
            fields: [
              "name",
              "name._2gram",
              "name._3gram",
              "asciiname",
              "asciiname._2gram",
              "asciiname._3gram"
            ]
          }
        },
        sort: [{population: "desc"}]
      }
      const res = await axios.post(ES_URL, data);
      this.setState({
        cities: res.data.hits.hits,
        focused: 0,
      });
    } catch (error) {
      this.setState({
        error: {
          status: true,
          message: error
        }
      });
    } finally {
      this.setState({isLoading: false})
    }
  } 

  getCity(cityId) {
    const cities = this.state.cities;
    for (let city of cities) {
      if (city._id === cityId) {
        return city;
      }
    }
    throw "City not found";
  }

  handleClick(event){
    const cityId = event.target.attributes["data-city-id"].value;
    const city = this.getCity(cityId);
    const {name, admin1, country, location} = city._source
    this.setState({
      selected: city,
      value: `${name}, ${admin1}, ${country}`,
      cities: [],
    })
    this.props.setLocation(location);
  }

  handleKeyDown(event) {
    const cf = this.state.focused;
    const cityLen = this.state.cities.length;
    if (event.keyCode === 40 || event.keyCode === 9) {
      // Down arrow or TAB key
        event.preventDefault();
        this.setState({
          focused: cf === cityLen - 1 ? 0 : cf + 1
        })
    } else if (event.keyCode === 38) {
      // Up arrow
      event.preventDefault();
      this.setState({
          focused: cf === 0 ? cityLen - 1 : cf - 1
      })
    } else if (event.keyCode === 13) {
      // enter key - same as clicking on the selection
      event.preventDefault();
      const city = this.state.cities[cf]
      const cityDiv = document.querySelector(`div[data-city-id='${city._id}']`);
      cityDiv.click();
    }
  }

  render () {
    const fi = this.state.focused;
    let cityOptions = this.state.cities.map((city, i) => (
      <div key={city._id} className={"ac_option" + (i === fi ? " ac_active" : "")} onClick={this.handleClick} data-city-id={city._id}>
        {city._source.name}, {city._source.admin1}, {city._source.country}
      </div>
    ))
    let loadingMsg = (
      <div>
        Searching for cities…
      </div>
    )
    let content;
    const { isLoading } = this.state;
    if (isLoading) {
      content = loadingMsg;
    } else {
      content = cityOptions;
    }
    return (
      <div className="form-group">
        <label htmlFor="city">City</label>
        <input 
          type="text" 
          className="form-control" 
          value={this.state.value} 
          onChange={this.handleChange} 
          onKeyDown={this.handleKeyDown} 
          name="city" 
          placeholder="Start typing to search for a city." />
        <div className="ac_container">
          {content}
        </div>
      </div>
    )

  }
}

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      terms: "",
      author: "",
      minYear: "",
      maxYear: "",
      location: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.setLocation = this.setLocation.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  setLocation(location) {
    this.setState({location: location})
  }

  clearForm( event ) {
    event.preventDefault();
    this.setState({
      terms: "",
      author: "",
      minYear: "",
      maxYear: "",
      location: [],
    })
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
      filter_items.push({range: {year: {gte: this.state.minYear, lte:this.state.maxYear}}})
    }

    if (this.state.location.length === 2) {
      filter_items.push({geo_distance: {distance: "100km", locations: this.state.location}})
    }
    const query = {
      bool: {
        must: must_items,
        filter: filter_items
      }
    }
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
        <CitySearch setLocation={this.setLocation} />
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
  const res = {
    loading: state.results.loading
  }
  return res;
}

SearchForm.propTypes = {
  fetchResults: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {fetchResults, setLoading})(SearchForm);
