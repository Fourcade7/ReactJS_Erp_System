import Pagination from 'react-bootstrap/Pagination';

function CustomPaginationScreen({ active, pageCount, setActive }) {
  let items = [];

  // First
  items.push(
    <Pagination.First
      key="first"
      onClick={() => setActive(1)}
      disabled={active === 1}
    />
  );

  // Prev
  items.push(
    <Pagination.Prev
      key="prev"
      onClick={() => setActive(active - 1)}
      disabled={active === 1}
    />
  );

  // Always show first page
  items.push(
    <Pagination.Item
      key={1}
      active={active === 1}
      onClick={() => setActive(1)}
    >
      1
    </Pagination.Item>
  );

  // Left ellipsis
  if (active > 3) {
    items.push(<Pagination.Ellipsis key="left-ellipsis" disabled />);
  }

  // Middle pages
  for (
    let number = Math.max(2, active - 1);
    number <= Math.min(pageCount - 1, active + 1);
    number++
  ) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === active}
        onClick={() => setActive(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  // Right ellipsis
  if (active < pageCount - 2) {
    items.push(<Pagination.Ellipsis key="right-ellipsis" disabled />);
  }

  // Always show last page
  if (pageCount > 1) {
    items.push(
      <Pagination.Item
        key={pageCount}
        active={active === pageCount}
        onClick={() => setActive(pageCount)}
      >
        {pageCount}
      </Pagination.Item>
    );
  }

  // Next
  items.push(
    <Pagination.Next
      key="next"
      onClick={() => setActive(active + 1)}
      disabled={active === pageCount}
    />
  );

  // Last
  items.push(
    <Pagination.Last
      key="last"
      onClick={() => setActive(pageCount)}
      disabled={active === pageCount}
    />
  );

  return <Pagination>{items}</Pagination>;
}

export default CustomPaginationScreen;