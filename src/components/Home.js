import React from 'react';
import styled from 'styled-components';
import SearchForm from './searchForm'; 

const Styles = styled.div`
    .homeContainer {
        width: 90%;
        height: auto;
        border: 1px solid gray;
        border-radius: 10px;
        margin: 50px auto;
    }
`;

const Home = () => {
    return (
        <Styles>
            <div className='homeContainer'>
                <SearchForm/>
            </div>
        </Styles>
    )
}

export default Home;