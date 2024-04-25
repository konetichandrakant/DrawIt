import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import GameItem from './GameItem';
import InfiniteScroll from 'react-infinite-scroll-component';

let pageDetails = { page: 0, limit: 10 }

function GameHistory() {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {

    initialLoad();

  }, [])

  const initialLoad = () => {
    axios.get(API_URL + '/games', {
      headers: {
        Authorization: localStorage.getItem('token')
      }, params: {
        page: pageDetails.page,
        limit: pageDetails.limit
      }
    }).then((res) => {
      if (res.data.length < pageDetails.limit) setHasMore(false);

      pageDetails = { ...pageDetails, page: pageDetails.page + 1 };
      data.concat(res.data);
      setData(data);
    }).catch(() => {
      navigate('/login');
    })
  }

  const fetchMore = () => {
    if (!hasMore) return;

    axios.get(API_URL + '/games', {
      headers: {
        Authorization: localStorage.getItem('token')
      }, params: {
        page: pageDetails.page,
        limit: pageDetails.limit
      }
    }).then((res) => {
      if (res.data.length < pageDetails.limit) setHasMore(false);

      pageDetails = { ...pageDetails, page: pageDetails.page + 1 };
      data.concat(res.data);
      setData(data);
    }).catch(() => {
      navigate('/login');
    })
  }

  return (
    <div>
      <Header />
      {
        !data && (
          <>
            Loading....
          </>
        )
      }
      {
        data && (
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={<>Loading...</>}
            endMessage={<>You are all set!!</>}
          >
            <div>
              {
                data.map((item) => {
                  <GameItem data={item} />
                })
              }
            </div>
          </InfiniteScroll>
        )
      }
    </div>
  )
}

export default GameHistory