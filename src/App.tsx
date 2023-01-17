import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';
import { Sex } from './types/Sex';

import usersFromServer from './api/users';
import productsFromServer from './api/products';
import categoriesFromServer from './api/categories';
import { Product } from './types/Product';
import { User } from './types/User';
import { Category } from './types/Category';

export enum SortBy {
  id = 'id',
  product = 'product',
  category = 'category',
  user = 'user',
}

const getUser = (id: number): User | null => {
  return (
    (usersFromServer as User[])
      // prettier-ignore
      .find((user: User) => user.id === id) || null
  );
};

const getCategory = (id: number): Category | null => {
  return (
    (categoriesFromServer as Category[])
      // prettier-ignore
      .find(category => category.id === id) || null
  );
};

function getProductsToDisplay() {
  return productsFromServer.map(product => {
    const category = getCategory(product.categoryId);
    const user = getUser(category?.ownerId || 0);

    return { ...product, category, user };
  });
}

const filterByUser = (products: Product[], userId: number) => {
  if (!userId) {
    return products;
  }

  return products.filter(product => product.user?.id === userId);
};

// eslint-disable-next-line
const filterByQuery = (products: Product[], query: string) => {
  if (!query) {
    return products;
  }

  // prettier-ignore
  return products.filter(product => product.name
    .toLowerCase()
    .includes(query.toLowerCase()));
};

const filterByCategory = (
  products: Product[],
  selectedCategories: number[],
) => {
  if (!selectedCategories.length) {
    return products;
  }

  return products.filter(product => {
    return selectedCategories.some(id => id === product.categoryId);
  });
};

const sortProductsBy = (
  products: Product[],
  sortBy: SortBy | null,
  isReversed: boolean,
) => {
  if (!sortBy) {
    return products;
  }

  const sortedPeople = [...products];

  sortedPeople.sort((a, b) => {
    switch (sortBy) {
      case SortBy.id:
        return a.id - b.id;
      case SortBy.product:
        return a.name.localeCompare(b.name);
      case SortBy.category:
        return a.category?.title.localeCompare(b.category?.title || '') || 0;
      case SortBy.user:
        return a.user?.name.localeCompare(b.user?.name || '') || 0;
      default:
        return 0;
    }
  });

  if (isReversed) {
    return sortedPeople.reverse();
  }

  return sortedPeople;
};

// prettier-ignore
const filterProducts = (

  products: Product[],
  userId: number,
  query: string,
  selectedCategories: number[],
  sortBy: SortBy | null,
  isReversed: boolean,
) => {
  const filteredByUser = filterByUser(products, userId);
  const filteredByCategory = filterByCategory(
    filteredByUser,
    selectedCategories,
  );
  const filteredByQuery = filterByQuery(filteredByCategory, query);

  const sortedProducts = sortProductsBy(filteredByQuery, sortBy, isReversed);

  return sortedProducts;
};

const productsToDisplay = getProductsToDisplay();

export const App: React.FC = () => {
  const [userId, setUserId] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortBy | null>(null);
  const [isReversed, setIsReversed] = useState(false);

  const clearAll = () => {
    setUserId(0);
    setQuery('');
    setSelectedCategories([]);
    setSortBy(null);
    setIsReversed(false);
  };

  const selectCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));

      return;
    }

    setSelectedCategories(prev => [...prev, categoryId]);
  };

  const sortByHandler = (sort: SortBy) => {
    if (sort !== sortBy) {
      setSortBy(sort);
      setIsReversed(false);

      return;
    }

    if (!isReversed) {
      setIsReversed(true);

      return;
    }

    setSortBy(null);
    setIsReversed(false);
  };

  const filteredProducts = filterProducts(
    productsToDisplay,
    userId,
    query,
    selectedCategories,
    sortBy,
    isReversed,
  );

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({
                  'is-active': !userId,
                })}
                onClick={() => setUserId(0)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  className={cn({
                    'is-active': userId === user.id,
                  })}
                  onClick={() => setUserId(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i
                    className="fas fa-search"
                    aria-hidden="true"
                  />
                </span>

                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length > 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.id),
                  })}
                  href="#/"
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className={cn('button is-link is-fullwidth', {
                  'is-outlined':
                    !userId && !query && selectedCategories.length < 1,
                })}
                onClick={clearAll}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    ID
                    <a
                      href="#/"
                      onClick={() => sortByHandler(SortBy.id)}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className={cn('fas', {
                            'fa-sort': !sortBy,
                            'fa-sort-up': sortBy === SortBy.id && !isReversed,
                            'fa-sort-down': sortBy === SortBy.id && isReversed,
                          })}
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Product
                    <a
                      href="#/"
                      onClick={() => sortByHandler(SortBy.product)}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className={cn('fas', {
                            'fa-sort': sortBy !== SortBy.product,
                            'fa-sort-up':
                              sortBy === SortBy.product && !isReversed,
                            'fa-sort-down':
                              sortBy === SortBy.product && isReversed,
                          })}
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Category
                    <a
                      href="#/"
                      onClick={() => sortByHandler(SortBy.category)}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className={cn('fas', {
                            'fa-sort': sortBy !== SortBy.category,
                            'fa-sort-up':
                              sortBy === SortBy.category && !isReversed,
                            'fa-sort-down':
                              sortBy === SortBy.category && isReversed,
                          })}
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    User
                    <a
                      href="#/"
                      onClick={() => sortByHandler(SortBy.user)}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className={cn('fas', {
                            'fa-sort': sortBy !== SortBy.user,
                            'fa-sort-up': sortBy === SortBy.user && !isReversed,
                            'fa-sort-down':
                              sortBy === SortBy.user && isReversed,
                          })}
                        />
                      </span>
                    </a>
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr
                    data-cy="Product"
                    key={product.id}
                  >
                    <td
                      className="has-text-weight-bold"
                      data-cy="ProductId"
                    >
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {`${product.category?.icon} - ${product.category?.title}`}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-danger': product?.user?.sex === Sex.Female,
                        'has-text-link': product?.user?.sex === Sex.Male,
                      })}
                    >
                      {product.user?.name}
                    </td>
                  </tr>
                ))
              ) : (
                <p data-cy="NoMatchingMessage">
                  No products matching selected criteria
                </p>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
