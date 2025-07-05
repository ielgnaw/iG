const getSearchParams = () => {
  const curSearchParams = new URLSearchParams(window.location.search);
  return Array.from(curSearchParams.keys()).reduce((result, key) => {
    return {
      ...result,
      [key]: curSearchParams.get(key) || '',
    };
  }, {});
};
