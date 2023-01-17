import React from 'react';
import cn from 'classnames';
import './App.scss';
import { Sex } from './types/Sex';

import usersFromServer from './api/users';
import productsFromServer from './api/products';
import categoriesFromServer from './api/categories';

function getProductsToDisplay() {
  const productWithCategory = productsFromServer.map(product => ({
    id: product.id,
    name: product.name,
    category:
      categoriesFromServer.find(
        category => category.id === product.categoryId,
      ) || null,
  }));

  return [
    ...productWithCategory.map(product => ({
      ...product,
      user:
        usersFromServer
          // prettier-ignore
          .find(user => user.id === product.category?.ownerId) || null,
    })),
  ];
}

// eslint-disable-next-line
const filterByUser = (products: any[], userId: number) => {
  if (!userId) {
    return products;
  }

  return products.filter(product => product.user?.id === userId);
};

const productsToDisplay = getProductsToDisplay();

export const App: React.FC = () => {
  const [userId, setUserId] = React.useState(0);

  const filteredProducts = filterByUser(productsToDisplay, userId);

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
                  value="qwe"
                />

                <span className="icon is-left">
                  <i
                    className="fas fa-search"
                    aria-hidden="true"
                  />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <button
                    data-cy="ClearButton"
                    type="button"
                    className="delete"
                  />
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className="button is-success mr-6 is-outlined"
              >
                All
              </a>

              <a
                data-cy="Category"
                className="button mr-2 my-1 is-info"
                href="#/"
              >
                Category 1
              </a>

              <a
                data-cy="Category"
                className="button mr-2 my-1"
                href="#/"
              >
                Category 2
              </a>

              <a
                data-cy="Category"
                className="button mr-2 my-1 is-info"
                href="#/"
              >
                Category 3
              </a>
              <a
                data-cy="Category"
                className="button mr-2 my-1"
                href="#/"
              >
                Category 4
              </a>
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
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
                    <a href="#/">
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className="fas fa-sort"
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Product
                    <a href="#/">
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className="fas fa-sort-down"
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Category
                    <a href="#/">
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className="fas fa-sort-up"
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    User
                    <a href="#/">
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className="fas fa-sort"
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
                    <td data-cy="ProductCategory">{`${product.category?.icon} - ${product.category?.title}`}</td>

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
