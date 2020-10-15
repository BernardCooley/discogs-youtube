import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import Discogs from '../api/index';

const Styles = styled.div`
    .searchFormContainer {
        width: 100%;
        height: auto;
        border-radius: 10px;
        display: flex;

        .resultsContainer {
            height: 400px;
            display: flex;
            width: 60%;
            padding: 20px;

            .listingsContainer {


                .artistAndTitle {
                    font-size: 24px;
                }

                .resultsList {
                    list-style: none
                }
            }
        }

        .formOuterContainer {
            width: 40%;
            padding: 20px;

            .formContainer{
                height: 100%;
                display: flex;
                flex-direction: column;
                width: 100%;

                .fieldContainer {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 16px;
                }

                .inputField {
                    margin-top: 5px;
                    height: 30px;
                    border-radius: 5px;
                    border: 1px solid lightgray;
                    padding-left: 10px;
                    font-size: 16px;
                }

                .searchButton {
                    font-size: 24px;
                    padding: 10px;
                    margin-top: 10px;
                }

                .yearRangeContainer {
                    margin: 0;
                    display: flex;
                    width: 100%;
                    justify-content: space-between;
                }
            }

        }
    }
`;

const SearchForm = () => {
    const agent = 'discogs-youtube/0.1.0';
    const token = {
        userToken: 'xPEpFIUQvWdCzKyvDqRpjMlYaPMlJCBcjtmtyrBQ'
    }
    const db = new Discogs.Client(agent, token).database();
    const mp = new Discogs.Client(agent, token).marketplace();
    const user = new Discogs.Client(agent, token).user();

    const [listings, setListings] = useState([]);
    const [formData, setFormData] = useState({});
    const [page, setPage] = useState(0);
    const [releases, setReleases] = useState([]);
    const [currentReleaseIndex, setCurrentReleaseIndex] = useState(0);
    const [currentRelease, setCurrentRelease] = useState();

    const params = {
        page: page,
        per_page: 100
    }


    const urls = [
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel',
        'https://www.discogs.com/label/642711-Head-Front-Panel'
    ];

    const { register, handleSubmit, errors } = useForm({
        defaultValues: {
            seller: 'skippedabeat',
            genre: 'Techno',
            yearFrom: 2016,
            yearTo: 2020
        }
    });

    useEffect(() => {
        if (listings.length > 0) {
            console.log(listings);
            getReleases();
        }
    }, [listings]);

    useEffect(() => {
        // console.log(releases);
        
        setCurrentRelease(releases[currentReleaseIndex]);
    }, [releases]);

    useEffect(() => {
        // console.log(currentRelease);
        getCurrentTracklist();
    }, [currentRelease]);

    const search = data => {
        setFormData({
            seller: data.seller,
            genre: data.genre,
            yearFrom: data.yearFrom,
            yearTo: data.yearTo
        });

        getListings(data.seller);
    }

    const getListings = seller => {
        const params = {
            page: page + 1,
            per_page: 100,
            status: 'For Sale'
        }

        setPage(page + 1);

        user.getInventory(seller, params, function (err, data) {
            if (data) {
                setListings(data.listings);
            }
        });
    }

    const getReleases = async () => {
        const filteredListings = listings.filter(listing => matchCriteria(listing));

        await Promise.all(
            filteredListings.map(async (listing, index) => {
                if (index === 25) {
                    return;
                }
                await db.getRelease(listing.release.id).then(release => {
                    if(release.styles.includes(formData.genre)) {
                        setReleases(releases => [...releases, release]);
                    }
                })
            })
        )
    }

    const matchCriteria = listing => {
        return (listing.release.format.includes('LP') || listing.release.format.includes('12')) && Number(listing.release.year) >= formData.yearFrom && Number(listing.release.year) <= formData.yearTo && listing.ships_from === 'United Kingdom';
    }

    const chooseRelease = backForward => {
        if(backForward === 'back') {
            if(currentReleaseIndex > 1) {
                setCurrentRelease(releases[currentReleaseIndex - 1]);
                setCurrentReleaseIndex(currentReleaseIndex - 1);
            }
        }else if (backForward === 'forward') {
            if(currentReleaseIndex < releases.length - 1) {
                setCurrentRelease(releases[currentReleaseIndex + 1]);
                setCurrentReleaseIndex(currentReleaseIndex + 1);
            }else {
                getListings(formData.seller);
            }
        }


        setCurrentRelease(releases[currentReleaseIndex]);
    }

    const getCurrentTracklist = () => {
        const tracks = [];

        if(currentRelease) {
            currentRelease.tracklist.forEach(track => {
                tracks.push({
                    artist: currentRelease.artists_sort,
                    title: track.title
                })
            })
        }

        return tracks;
    }

    const Form = () => {
        return (
            <div className='formOuterContainer'>
                <form onSubmit={handleSubmit(search)} className="formContainer" noValidate>
                    <div className='fieldContainer'>
                        <label>Seller</label>
                        <input className={`inputField ${errors.seller ? 'errorBorder' : ''}`} type="text" name="seller" ref={register()}></input>
                    </div>

                    <div className='fieldContainer'>
                        <label>Genre</label>
                        <input className={`inputField ${errors.genre ? 'errorBorder' : ''}`} type="text" name="genre" ref={register()}></input>
                    </div>

                    <div className='yearRangeContainer'>
                        <div className='fieldContainer'>
                            <label>Year from</label>
                            <input className={`inputField ${errors.yearFrom ? 'errorBorder' : ''}`} type="number" name="yearFrom" ref={register()}></input>
                        </div>

                        <div className='fieldContainer'>
                            <label>Year to</label>
                            <input className={`inputField ${errors.yearTo ? 'errorBorder' : ''}`} type="number" name="yearTo" ref={register()}></input>
                        </div>
                    </div>

                    <button className='searchButton' type="submit">Search</button>
                </form>
            </div>
        )
    }

    const SearchedListings = () => {
        return (
            <div className='resultsContainer'>
                {releases.length > 0 ?
                    <div className='listingsContainer'>
                        <div className='releaseArtistAndTitleLabel'>Release</div>
                        <div className='artistAndTitle'>
                            {
                                releases[currentReleaseIndex].artists_sort} - {releases[currentReleaseIndex].title
                            }
                        </div>
                        <div className='tracksLabel'>Tracks</div>
                        <div className='tracks'>
                            {currentRelease ? getCurrentTracklist().map((track, index) => (
                                <div key={index} className=''>
                                    {track.artist} - {track.title}
                                </div>
                            )): null}
                        </div>
                    </div> : null
                }
            </div>
        )
    }

    return (
        <Styles>
            <div className='searchFormContainer'>
                <Form />
                <SearchedListings />
            </div>
        </Styles>
    )
}

export default SearchForm;