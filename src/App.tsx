import React, {useRef, useState, useEffect} from 'react';
import './reset.css'
import './App.css';
import {FixedSizeList as List, FixedSizeListProps} from 'react-window'
import styled from 'styled-components'
import AutoSizer from "react-virtualized-auto-sizer";
import faker from 'faker'

const Wrapper = styled.div`
  margin: 0;
  padding:0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`

const Title = styled.h2`
  font-size: 2rem;
  padding: 1rem;
`


const Header = styled.header`
  position: fixed;
  top: 0;
  left:0;
  right: 15px; // fix scrollbar width
  background-color: #FFFFFF;
  z-index: 1000;
`

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: none;
  &:focus{
    outline: 0;
  }
`

interface SearchInputProps {
  value: string;
  onChangeValue?: (value: string) => void
}

const SearchInput: React.FC<SearchInputProps> = ({value, onChangeValue}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeValue && onChangeValue(e.target.value);
  }
  return <StyledInput
    value={value}
    onChange={handleChange}
    placeholder='Type for filter...'/>
}


const Row = styled.div`
  display: flex;
  padding: 1rem;
  background-color: #f3f3f3;
`

const Cell = styled.div`
  display: flex;
  flex: 0.5;
`




export function generateListItem(){
  return {
    id: faker.random.uuid(),
    text: faker.random.uuid().toString()
  }
}

export type ItemStruct = ReturnType<typeof generateListItem>


export function generateListItems(count: number): Promise<ItemStruct[]>{
  return new Promise((resolve, reject) =>
    resolve(Array(count).fill(null).map(()=>generateListItem())))
}


interface RowRendererProps {
  index: number;
  style: any;
  data: any;
  headerHeight: number;
  onRequestMore: (index: number) => void
}

const RowRenderer: React.FC<RowRendererProps> = ({index, style, data, headerHeight, onRequestMore}) => {
  if(data.length < index + 1){
    onRequestMore && onRequestMore(index);
    return <Row
      style={{
        ...style,
        top: `${parseFloat(style.top) + headerHeight}px`
      }}><Cell>LOADING</Cell></Row>
  }
  const {id, text} = data[index];
  return <Row
    style={{
      ...style,
      top: `${parseFloat(style.top) + headerHeight}px`
    }}>
    <Cell>{index}__{id}</Cell>
    <Cell>{text}</Cell>
  </Row>
};


const count = 100000;

const App: React.FC = () => {
  const headerRef = useRef(null);
  const listRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [requestMore, setRequestMore] = useState(true)
  const [allItems, setAllItems] = useState<ItemStruct[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemStruct[]>([])
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // @ts-ignore
    headerRef && setHeaderHeight(headerRef.current.clientHeight)
  })
  useEffect(() => {
    if(requestMore && allItems.length < count) {
      generateListItems(20).then((items) => {
        setAllItems(allItems.concat(items));
        setRequestMore(false)
      })
    }
  }, [requestMore]);

  useEffect(() => {
      const _filteredItems = allItems.filter((item) => item.text.includes(filter));
      setFilteredItems(_filteredItems);
  }, [filter, requestMore]);
  useEffect(() => {
    // @ts-ignore
    listRef.current && listRef.current.scrollToItem(0);
  }, [filter])

  const handleRequestMore = (index: number) => {
    !requestMore && setRequestMore(true)
  }

  const items = filter.length > 0 ? filteredItems : allItems;

  return (
    <Wrapper>
      <Header ref={headerRef}>
        <Title>100k elements list</Title>
        <SearchInput
          value={filter}
          onChangeValue={setFilter}
        />
      </Header>
      <AutoSizer>
        {({height, width}) => {
          return (
            <List
              height={height}
              itemCount={items.length + 1}
              itemSize={50}
              width={width}
              ref={listRef}
              itemData={items}
            >
              {(props) => <RowRenderer {...props}
                                       headerHeight={headerHeight}
                                       onRequestMore={handleRequestMore}
              />}
            </List>
          )
        }}
      </AutoSizer>
    </Wrapper>
  );
}

export default App
