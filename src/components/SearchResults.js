import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

function AuthorItem(props) {
  let content = props.author.author_name
  if (props.author.affiliation) {
    content = content + " - " + props.author.affiliation.affiliation_name
  }
    return (
      <li key={props.author.author_id}>
        {content}
      </li>
      )
}

AuthorItem.propTypes = {
  author: PropTypes.object.isRequired
}

function PaperResult(props) {
  const fos = props.hit._source.fields_of_study.map((field) => (
    <span key={field.field_of_study_id} className="fos-span">
      {field.fos_name}
    </span>
  ))
  const authors = props.hit._source.authors.map((author) => (<AuthorItem key={author.author_id} author={author}/>))
  return (
    <div key={props.hit._source.paper_id} className="search-result">
      <h3 className="paper-title">{props.hit._source.paper_title}</h3>
      <p className="year">{props.hit._source.year}</p>
      <h4>Fields of Study</h4>
      <p className="fos-list">
        {fos} 
      </p>
      <h4>Authors</h4>
      <ul>
        {authors}
      </ul>
    </div>
  )
}

PaperResult.propTypes = {
  hit: PropTypes.object.isRequired
}

function InventorItem(props) {
  content = props.inventor.name
  const city = props.inventor.location.city;
  const state = props.inventor.location.state;
  const country = props.inventor.location.country;
  if (city || state || country) {
    content += " - "
    if (city) {
      content += city
    }

    if (state) {
      if (city) {
        content += `, ${state}`
      } else {
        content += state
      }
    }

    if (country) {
      content += ` ${country}`
    }
  }

  return (
    <li key={props.inventor.id}>
      {content}
    </li>
  )
}

function CPCGroupItem(props) {
  return (
    <li key={props.group[0]}>
      <details>
        <summary>{props.group[0]}</summary>
        <p>{props.group[1]}</p>
      </details>
    </li>
  )
}

function PatentResult(props) {
  const inventors = props.hit._source.inventors.map((inventor) => (<InventorItem inventor={inventor}/>));
  const cpc_groups = props.hit._source.cpc.groups.map((group, index) => (<CPCGroupItem key={index} group={group} />));
  return (
    <div key={props.hit._source.id} className="search-result">
      <h3>{props.hit._source.title}</h3>
      <p className="m-0"><small>Patent ID: {props.hit._source.id}</small></p>
      <p className="m-0"><small>{props.hit._source.date}</small></p>

      <details>
        <summary>Abstract</summary>
        <p>{props.hit._source.abstract}</p>
      </details>
      <h4>CPC Groups</h4>
      <ul>
        {cpc_groups}
      </ul>
      <h4>Inventors</h4>
      <ul>
        {inventors}
      </ul>
    </div>
  )
}

PatentResult.propTypes = {
  hit: PropTypes.object.isRequired
}

function NoResults(props) {
  return (
    <p className="p-5">No Results Found</p>
  )
}

function SearchInvite(props) {
  return (
    <p className="p-5">Enter a query above and click "Submit" to search</p>
  )
}

class SearchResults extends Component {
    
  render() {
    let paperHits, patentHits;
    console.log(`searched = ${this.props.searched}`);
    if (this.props.papers.length > 0) {
      paperHits = this.props.papers.map((hit) => <PaperResult key={hit._id} hit={hit} />);
    } else if (this.props.searched) {
      paperHits = <NoResults />
    } else {
      paperHits = <SearchInvite />
    }
    
    if (this.props.patents.length > 0) {
      patentHits = this.props.patents.map((hit) => <PatentResult key={hit._id} hit={hit} />);
    } else if (this.props.searched) {
      patentHits = <NoResults />
    } else {
      patentHits = <SearchInvite />
    }
    return (
      <Tabs defaultActiveKey="papers" transition={false} id="search-results_tabs">
        <Tab eventKey="papers" title="Papers">
          {paperHits}
        </Tab>
        <Tab eventKey="patents" title="Patents">
          {patentHits}
        </Tab>
      </Tabs>
    );
  }
}

function mapStateToProps(state) {
  const res = {
    papers: state.results.papers.hits,
    patents: state.results.patents.hits,
    searched: state.results.searched,
  }
  return res;
}

SearchResults.propTypes = {
  papers: PropTypes.array.isRequired,
  patents: PropTypes.array.isRequired,
  searched: PropTypes.bool
}

export default connect(mapStateToProps)(SearchResults);
