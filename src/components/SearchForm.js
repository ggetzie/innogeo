import React, { Component } from 'react';
import { connect } from 'react-redux';
import { 
  clearResults,
  savePapers,
  savePatents,
  thunkResults
} from '../actions/resultActions';
import { setLoading } from '../actions/loadingActions'
import PropTypes from 'prop-types';
import axios from 'axios';
import { debounce } from "lodash";
import { ES_URL } from '../lib/util';
import Form from 'react-bootstrap/Form';

function LoadingDetail(props) {
  let content;
  content = `Received ${props.data.received} of ${props.data.relation}${props.data.total} ${props.index}`;
  if (!props.data.isLoading) {
    content = `${props.index} completed. ` + content;
  }
  return (
    <p>
      {content}
    </p>
  )
}

function LoadingData(props) {
  return (
    <div className="loading-info">
      <div className="spinner"></div>
      {props.ld.papers.requested && 
        <LoadingDetail data={props.ld.papers} index="papers" />}
      {props.ld.patents.requested &&
        <LoadingDetail data={props.ld.patents} index="patents" />}
    </div>
  )
}

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
      <Form.Group>
        <Form.Label htmlFor="city">City</Form.Label>
        <Form.Control
          type="text" 
          value={this.state.value} 
          onChange={this.handleChange} 
          onKeyDown={this.handleKeyDown} 
          name="city" 
          placeholder="Start typing to search for a city." />
        <div className="ac_container">
          {content}
        </div>
      </Form.Group>
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
      papers: true,
      patents: true,
      results: 1000
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.setLocation = this.setLocation.bind(this);
    this.paperParams = this.paperParams.bind(this);
  }

  handleChange(event) {
    if (event.target.type === "checkbox") {
      this.setState({[event.target.name]: event.target.checked});
    } else {
      this.setState({[event.target.name]: event.target.value});
    }
    
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
      papers: true,
      patents: true,
      results: 1000,
    })
  }

  paperParams() {
    let must_items = [];
    let filter_items = [{
      "script": {
        "script": "doc['locations'].size() > 1"
      }
    }];
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
    const search_params = {
      size: 3000,
      query: query,
      index: "papers",
      sort: ["_score", "_doc"]
    }
    return search_params
  }

  patentParams() {
    let must_items = [];
    let minDate, maxDate;
    let filter_items = [{
      "script": {
        "script": "doc['locations'].size() > 2"
      }
    }];
    if (this.state.terms) {
      must_items.push({
        multi_match: {
          query: this.state.terms,
          fields: ["title", "abstract"]
        }
      });
    }
    if (this.state.author) {
      must_items.push({match: {"inventors.name": this.state.author}});
    }
    if (this.state.minYear) {
      minDate = `${this.state.minYear}-01-01`
    } else {
      minDate = "1776-07-04"
    }
    if (this.state.maxYear) {
      maxDate = `${this.state.maxYear}-12-31`
    } else {
      const d = new Date();
      maxDate=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
    }
    if (this.state.minYear && this.state.maxYear) {
      filter_items.push({range: {date: {gte: this.state.minYear, lte:this.state.maxYear}}})
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
    const search_params = {
      size: 1000,
      query: query,
      index: "patents",
      sort: ["_score", "_doc"]
    }
    return search_params

  }

  handleSubmit( event ) {
    event.preventDefault();
    this.props.clearResults();
    if (this.state.papers) {
      this.props.thunkResults(this.paperParams());
      // fetchAllHits(this.paperParams(), this.props.setLoading).then(hits => {
      //   console.log(`Saving ${hits.length} papers`)
      //   this.props.savePapers(hits);
        
      // });
    }

    if (this.state.patents) {
      this.props.thunkResults(this.patentParams());
      //   fetchAllHits(this.patentParams(), this.props.setLoading).then(hits => {
      //     console.log(`Saving ${hits.length} patents`)
      //     this.props.savePatents(hits);
      // });
    }
  }

  render() {
    let content;
    if (this.props.loading.papers.isLoading || this.props.loading.patents.isLoading) {
      content = <LoadingData ld={this.props.loading} />
    } else {
      content = (
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor="terms">
              Keywords
            </Form.Label>
            <Form.Control type="text" value={this.state.terms} onChange={this.handleChange} name="terms" />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="author">Author</Form.Label>
            <Form.Control type="text" value={this.state.author} onChange={this.handleChange} name="author" />
          </Form.Group>
          <Form.Text as="p">
            Search for papers published between:
          </Form.Text>
          <Form.Row>
            <Form.Group className="col">
              <Form.Label htmlFor="minYear">Start Year</Form.Label>
              <Form.Control type="number" value={this.state.minYear} onChange={this.handleChange} name="minYear" />
            </Form.Group>
            <Form.Group className="col">
              <Form.Label htmlFor="maxYear">
                End Year
              </Form.Label>
              <Form.Control type="number" value={this.state.maxYear} onChange={this.handleChange} name="maxYear" />
            </Form.Group>
          </Form.Row>
          <CitySearch setLocation={this.setLocation} />

          <Form.Row>
            <Form.Group className="col">
              <Form.Row>
                <Form.Group className="col">
                  <Form.Text as="p">Search for:</Form.Text>
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group className="col">
                  <Form.Check inline label="patents" type="checkbox" onChange={this.handleChange} name="patents" checked={this.state.patents} />
                </Form.Group>
                <Form.Group className="col">
                  <Form.Check inline label="papers" type="checkbox" onChange={this.handleChange} name="papers" checked={this.state.papers} />
                </Form.Group>
              </Form.Row>
            </Form.Group>
          </Form.Row>

        <div className="d-flex flex-row-reverse">
          <input className="btn btn-primary" type="submit" value="Submit" />
          <button className="btn btn-secondary mr-2" role="button" onClick={this.clearForm}>Clear</button>
        </div>

        </Form>
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
    loading: state.results.loading,
    papers: state.results.papers,
    patents: state.results.patents
  }
  console.log("state in searchForm")
  console.log(res)
  return res;
}

SearchForm.propTypes = {
  setLoading: PropTypes.func.isRequired,
  clearResults: PropTypes.func.isRequired,
  savePapers: PropTypes.func.isRequired,
  savePatents: PropTypes.func.isRequired,
  thunkResults: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {
  setLoading, 
  clearResults,
  savePapers,
  savePatents,
  thunkResults,
})(SearchForm);
