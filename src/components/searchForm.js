import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import Discogs from '../api/index';

const Styles = styled.div`
    .searchFormContainer {
        width: 90%;
        height: auto;
        border-radius: 10px;
        margin: 50px auto;

        .formContainer{
            display: flex;
            flex-direction: column;
            width: 50%;
            margin: 30px auto;

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
`;

const SearchForm = () => {
    const db = new Discogs.Client().database();
    const mp = new Discogs.Client().marketplace();
    const user = new Discogs.Client().user();
    const [listings, setListings] = useState([]);
    const [formData, setFormData] = useState({});
    const [pages, setPages] = useState(0);

    const params = {
        page: 1,
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
            pageNumber: 1,
            yearFrom: 2010,
            yearTo: 2020
        }
    });

    useEffect(() => {
        if(listings.length > 0) {
            console.log(listings);
            console.log('----------------------------------------');
            filterListings();
        }
    }, [listings]);

    useEffect(() => {
        if (pages > 0) {
            getListings();
        }
    }, [pages]);

    const search = data => {
        setFormData({
            seller: data.seller,
            pageNumber: data.pageNumber,
            yearFrom: data.yearFrom,
            yearTo: data.yearTo
        });

        user.getInventory('skippedabeat', params, function (err, data) {
            setPages(data.pagination.pages);
        });

        

        // urls.forEach(url => {
        //     window.open(url, '_blank');
        // });
    }

    const getListings = async () => {
            await Promise.all(
                Array(pages).fill().map(async (id, index) => {
                    params.page = index + 1;

                    await user.getInventory('skippedabeat', params, function (err, data) {
                        if(data) {
                            setListings(listings => [...listings, ...data.listings]);
                        }
                    });
                })
            )
    }

    const filterListings = () => {
        const filteredListings = listings.filter(listing => listing.release.format.includes('LP'));

        // console.log(filteredListings);

        db.getRelease(filteredListings[0].release.id, function (err, data) {
            console.log(data.styles);
            if (data.styles.includes('Techno')) {
                console.log('yes');
            }
        });

        // filteredListings.forEach(listing => {
        //     // console.log(listing.release.id);

        //     db.getRelease(filteredListings[0].release.id, function (err, data) {
        //         console.log(data);
        //     });
        // });
    }

    return (
        <Styles>
            <div className='searchFormContainer'>
                <form onSubmit={handleSubmit(search)} className="formContainer" noValidate>
                    <div className='fieldContainer'>
                        <label>Seller</label>
                        <input className={`inputField ${errors.seller ? 'errorBorder' : ''}`} type="text"  name="seller" ref={register()}></input>
                    </div>

                    <div className='fieldContainer'>
                        <label>Page number</label>
                        <input className={`inputField ${errors.pageNumber ? 'errorBorder' : ''}`} type="number" name="pageNumber" ref={register()}></input>
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
        </Styles>
    )
}

export default SearchForm;