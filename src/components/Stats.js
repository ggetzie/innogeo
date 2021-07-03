import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from "prop-types";

function Stats(props) {
    const paper_graph = useSelector((state) => (state.results.papers.graph));
    const patent_graph = useSelector((state) => (state.results.patents.graph));
    const searched = useSelector((state) => (state.results.searched))
    const totalPapers = paper_graph.itemArray.length;
    const HKPapers = paper_graph.inHK;
    const HKPapersPct = (HKPapers / totalPapers) * 100;
    const totalPatents = patent_graph.itemArray.length;
    const HKPatents = patent_graph.inHK;
    const HKPatentsPct = (HKPatents / totalPatents) * 100;

    let content;
    if (searched) {
        content = (
            <table className="table">
            <thead className="thead-light">
                <tr>
                    <th scope="col"></th>
                    <th scope="col">Papers</th>
                    <th scope="col">Patents</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row" className="text-right">Total</th>
                    <td>{totalPapers}</td>
                    <td>{totalPatents}</td>
                </tr>
                <tr>
                    <th scope="row" className="text-right">In Hong Kong</th>
                    <td>{HKPapers} - {HKPapersPct.toFixed(1)}%</td>
                    <td>{HKPatents} - {HKPatentsPct.toFixed(1)}%</td>
                </tr>
            </tbody>
        </table>
        )
    } else {
        content = <p></p>
    }

    return content;
}

export default Stats