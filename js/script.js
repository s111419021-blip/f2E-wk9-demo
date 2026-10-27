const stores = [
  {
    name: "莫平方 m² café",
    aliases: ["莫平方", "m² café", "m²", "m2", "café", "cafe"],
    href: "restaurant1.html",
  },
  {
    name: "好運站",
    aliases: ["好運站", "好運", "運站"],
    href: "restaurant2.html",
  },
];

const normalize = (value) => value.trim().toLocaleLowerCase();

document.querySelectorAll(".search").forEach((form) => {
  const input = form.querySelector('input[type="search"]');
  const results = form.querySelector(".search-results");

  if (!input || !results) {
    throw new Error("店名搜尋欄缺少必要的輸入框或建議清單。");
  }

  let matches = [];
  let activeIndex = -1;

  const closeResults = () => {
    results.hidden = true;
    results.replaceChildren();
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  };

  const navigateToStore = (store) => {
    window.location.href = store.href;
  };

  const renderResults = () => {
    results.replaceChildren();
    activeIndex = -1;

    if (matches.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "search-empty";
      emptyMessage.textContent = "該当する店舗が見つかりません";
      results.append(emptyMessage);
    } else {
      matches.forEach((store, index) => {
        const item = document.createElement("li");
        const option = document.createElement("button");
        option.id = `search-option-${index}`;
        option.type = "button";
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        option.textContent = store.name;
        item.append(option);
        results.append(item);
      });
    }

    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };

  const updateResults = () => {
    const query = normalize(input.value);

    if (!query) {
      matches = [];
      closeResults();
      return;
    }

    matches = stores.filter((store) =>
      [store.name, ...store.aliases].some((term) => normalize(term).includes(query)),
    );
    renderResults();
  };

  const setActiveOption = (index) => {
    const options = results.querySelectorAll('[role="option"]');

    if (options.length === 0) return;

    activeIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      const isActive = optionIndex === activeIndex;
      option.setAttribute("aria-selected", String(isActive));

      if (isActive) {
        input.setAttribute("aria-activedescendant", option.id);
        option.scrollIntoView({ block: "nearest" });
      }
    });
  };

  input.addEventListener("input", updateResults);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeResults();
      return;
    }

    if (results.hidden) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveOption(activeIndex < 0 ? 0 : activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveOption(activeIndex < 0 ? matches.length - 1 : activeIndex - 1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      navigateToStore(matches[activeIndex]);
    }
  });

  results.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const option = event.target.closest('[role="option"]');
    if (!option) return;

    const index = [...results.querySelectorAll('[role="option"]')].indexOf(option);
    if (index >= 0) navigateToStore(matches[index]);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (matches.length > 0) navigateToStore(matches[activeIndex >= 0 ? activeIndex : 0]);
    else updateResults();
  });

  form.addEventListener("focusout", (event) => {
    if (!form.contains(event.relatedTarget)) closeResults();
  });
});