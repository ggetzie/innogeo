import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";

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
      <h3>Title: <span className="paper-title">{props.hit._source.paper_title}</span></h3>
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

class SearchResults extends Component {
    
  render() {
    let resultHits;
    console.log(`searched = ${this.props.searched}`);
    if (this.props.papers.length > 0) {
      resultHits = this.props.papers.map((hit) => <PaperResult key={hit._id} hit={hit} />);
    } else if (this.props.searched) {
      resultHits = <p>No results found</p>
    } else {
      resultHits = <p>Enter query above and click "Submit" to search.</p>
    }
    

    return (
      <div>
          <React.Fragment>
            <h2>Papers</h2>
            {resultHits}
          </React.Fragment>
      </div>
    );
  }
}
function mapStateToProps(state) {
  console.log("mapping state")
  console.log(state)
  const res = {
    papers: state.results.papers,
    searched: state.results.searched
  }
  return res;
}

SearchResults.propTypes = {
  papers: PropTypes.array.isRequired,
  searched: PropTypes.bool
}

export default connect(mapStateToProps)(SearchResults);
