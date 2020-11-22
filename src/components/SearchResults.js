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

AuthorItem.PropTypes = {
  author: PropTypes.object.isRequired
}

function PaperResult(props) {
  const fos = props.hit._source.fields_of_study.map((field) => (
    <li key={field.field_of_study_id}>
      {field.fos_name}
    </li>
  ))
  const authors = props.hit._source.authors.map((author) => (<AuthorItem key={author.author_id} author={author}/>))
  return (
    <div key={props.hit._source.paper_id} className="search-result">
      <h3>Title: <span className="paper-title">{props.hit._source.paper_title}</span></h3>
      <h4>Fields of Study</h4>
      <ul className="fos-list">
        {fos}
      </ul>
      <h4>Authors</h4>
      <ul>
        {authors}
      </ul>
    </div>
  )
}

PaperResult.PropTypes = {
  hit: PropTypes.object.isRequired
}

class SearchResults extends Component {
    
  render() {
    let resultHits = this.props.papers.map((hit) => <PaperResult hit={hit} />);

    return (
      <div>
        {resultHits.length > 0 && 
          <React.Fragment>
            <h2>Papers</h2>
            {resultHits}
          </React.Fragment>
        }
      </div>
    );
  }
}
function mapStateToProps(state) {
  const res = {
    papers: state.papers.papers
  }
  return res;
}

SearchResults.propTypes = {
  papers: PropTypes.array.isRequired
}

export default connect(mapStateToProps)(SearchResults);
