import React, { useEffect, useRef, useState } from "react";
import ReactDom from "react-dom";

const styleStr = `:root{-moz-tab-size:4;tab-size:4}input{font-family:inherit;font-size:100%;line-height:1.15;margin:0}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}ul{list-style:none;margin:0;padding:0}*,:after,:before{box-sizing:border-box;border:0 solid #e7e5e4}input::-webkit-input-placeholder{opacity:1;color:#a8a29e}input:-ms-input-placeholder{opacity:1;color:#a8a29e}input::placeholder{opacity:1;color:#a8a29e}input{padding:0;line-height:inherit;color:inherit}.bg-black{--tw-bg-opacity:1;background-color:rgba(0,0,0,var(--tw-bg-opacity))}.bg-gray-800{--tw-bg-opacity:1;background-color:rgba(41,37,36,var(--tw-bg-opacity))}.bg-blue-500{--tw-bg-opacity:1;background-color:rgba(59,130,246,var(--tw-bg-opacity))}.hover\:bg-gray-500:hover{--tw-bg-opacity:1;background-color:rgba(120,113,108,var(--tw-bg-opacity))}.hover\:bg-gray-600:hover{--tw-bg-opacity:1;background-color:rgba(87,83,78,var(--tw-bg-opacity))}.bg-opacity-30{--tw-bg-opacity:0.3}.border-gray-500{--tw-border-opacity:1;border-color:rgba(120,113,108,var(--tw-border-opacity))}.rounded-lg{border-radius: 8px}.rounded-xl{border-radius:12px}.rounded-b-xl{border-bottom-right-radius:12px;border-bottom-left-radius:12px}.border{border-width:1px}.border-t-0{border-top-width:0}.flex{display:-webkit-flex;display:flex}.items-center{-webkit-align-items:flex-start;align-items:flex-start}.justify-center{-webkit-justify-content:center;justify-content:center}.justify-between{-webkit-justify-content:space-between;justify-content:space-between}.font-extralight{font-weight:200}.text-sm{font-size:14px;line-height:20px}.text-3xl{font-size:30px;line-height:36px}.-mt-3{margin-top:-12px}.opacity-90{opacity:.9}.focus\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.p-2{padding:8px}.py-1{padding-top:4px;padding-bottom:4px}.px-1{padding-left:4px;padding-right:4px}.px-3{padding-left:12px;padding-right:12px}.pb-1{padding-bottom:4px}.pt-4{padding-top:16px}.pl-11{padding-left:44px}.placeholder-gray-400::-webkit-input-placeholder{--tw-placeholder-opacity:1;color:rgba(168,162,158,var(--tw-placeholder-opacity))}.placeholder-gray-400:-ms-input-placeholder{--tw-placeholder-opacity:1;color:rgba(168,162,158,var(--tw-placeholder-opacity))}.placeholder-gray-400::placeholder{--tw-placeholder-opacity:1;color:rgba(168,162,158,var(--tw-placeholder-opacity))}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative;margin-top: 200px}.top-0{top:0}.right-0{right:0}.bottom-0{bottom:0}.left-0{left:0}.top-full{top:100%}*{--tw-shadow:0 0 transparent;--tw-ring-inset:var(--tw-empty,/*!*/ /*!*/);--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,0.5);--tw-ring-offset-shadow:0 0 transparent;--tw-ring-shadow:0 0 transparent}.text-gray-100{--tw-text-opacity:1;color:rgba(245,245,244,var(--tw-text-opacity))}.text-gray-200{--tw-text-opacity:1;color:rgba(231,229,228,var(--tw-text-opacity))}.text-gray-300{--tw-text-opacity:1;color:rgba(214,211,209,var(--tw-text-opacity))}.text-gray-500{--tw-text-opacity:1;color:rgba(120,113,108,var(--tw-text-opacity))}.italic{font-style:italic}.w-full{width:100%}.spotlight{opacity:0;margin-top:0px;z-index: 9999;}@media screen and (max-width:768px;){.spotlight{margin-top: 0px}}.spotlight input{background-image:url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIuMDA1IDUxMi4wMDUiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik01MDUuNzQ5IDQ3NS41ODdsLTE0NS42LTE0NS42YzI4LjIwMy0zNC44MzcgNDUuMTg0LTc5LjEwNCA0NS4xODQtMTI3LjMxN0M0MDUuMzMzIDkwLjkyNiAzMTQuNDEuMDAzIDIwMi42NjYuMDAzUzAgOTAuOTI1IDAgMjAyLjY2OXM5MC45MjMgMjAyLjY2NyAyMDIuNjY3IDIwMi42NjdjNDguMjEzIDAgOTIuNDgtMTYuOTgxIDEyNy4zMTctNDUuMTg0bDE0NS42IDE0NS42YzQuMTYgNC4xNiA5LjYyMSA2LjI1MSAxNS4wODMgNi4yNTFzMTAuOTIzLTIuMDkxIDE1LjA4My02LjI1MWM4LjM0MS04LjM0MSA4LjM0MS0yMS44MjQtLjAwMS0zMC4xNjV6TTIwMi42NjcgMzYyLjY2OWMtODguMjM1IDAtMTYwLTcxLjc2NS0xNjAtMTYwczcxLjc2NS0xNjAgMTYwLTE2MCAxNjAgNzEuNzY1IDE2MCAxNjAtNzEuNzY2IDE2MC0xNjAgMTYweiIvPjwvc3ZnPg==");background-repeat:no-repeat;background-size:18px;background-position:2% 50%;caret-color:#fff}.-z-1{z-index:-1}.spotlight.active{opacity:1}.spotlight>div{width:600px;max-width:95vw;box-shadow:0 10px 20px 5px rgba(0,0,0,.5)}::-moz-focus-inner,::-moz-focus-outer{outline:none}`;

const sc = "p";

function sort(sortList, inputStr) {
  const getSortLevel = (list) => {
    const continuous = list.reduce((list, item) => {
      if (!list.length) return [[item]];
      const preList = list[list.length - 1];
      if (item - 1 !== preList[preList.length - 1]) return [...list, [item]];
      preList.push(item);
      return list;
    }, []);

    return continuous;
  };

  var getKeyIndex = (str, key, startIndex) => {
    const index = str.slice(startIndex + 1).indexOf(key);
    if (index === -1) return -1;
    return index + startIndex + 1;
  };

  var getStrKey = (str) =>
    inputStr.split("").reduce((list, key, index) => {
      const startIndex = index === 0 ? -1 : list[index - 1];
      if ([undefined, -1].includes(startIndex) && index !== 0) return list;

      return list.concat(getKeyIndex(str, key, startIndex));
    }, []);

  const result = sortList
    .map((str) => {
      const list = getStrKey(str.toLowerCase());
      return list.includes(-1) ? undefined : [str, ...list];
    })
    .filter((v) => v);

  return result
    .map((v) => [v[0], getSortLevel(v.slice(1))])
    .sort((a, b) => {
      const [aName, aIndexList] = a;
      const [bName, bIndexList] = b;

      if (aIndexList.length !== bIndexList.length) {
        return aIndexList.length < bIndexList.length ? -1 : 1;
      } else {
        return aName.length < bName.length ? -1 : 1;
      }
    });
}

function Spotlight({ inIframe, rsdk, wrapperRef }) {
  const [isActive, setIsActive] = useState(false);

  const blur = (timeout = 100) => {
    setTimeout(() => {
      setIsActive(false);
    }, timeout);
  };

  useEffect(() => {
    const keyDownCb = (e) => {
      if (e.key === sc && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        
        if (inIframe)
          window.parent.postMessage({ method: "openSpotlight" }, "*");
         else 
          setIsActive(true);
        }
    };

    function postMessage(e) {
      if (e.data && e.data.method == "openSpotlight") {
        setIsActive(true);
      }
    }
    window.addEventListener("keydown", keyDownCb);
    window.addEventListener("message", postMessage);

    return () => {
      window.removeEventListener("keydown", keyDownCb);
      window.removeEventListener("message", postMessage);
    };
  }, []);

  const [inputValue, setInputValue] = useState("");
  const [flatRoutes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const selectedIndexRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      inputRef.current.focus();
      setInputValue("");

      async function loadData() {
        const res = await fetch(rsdk.origin + "/allModules", { method: "get" });
        const data = (await res.json()).data;
        const list = Object.keys(data).map((key) => ({ name: key, path: key }));
        setRoutes(list);
      }
      loadData();
    }
  }, [isActive]);

  const handleInput = (e) => setInputValue(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = suggestions[selectedIndex];
    if (!target) return;
    rsdk.exec(target.name, ...target.options);
    blur();
  };

  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    const pressKeys = (e) => {
      if (e.keyCode === 40) {
        // arrow DOWN
        if (selectedIndexRef.current >= suggestionsRef.current.length - 1) {
          setSelectedIndex(0);
        } else {
          setSelectedIndex((s) => s + 1);
        }
      }
      if (e.keyCode === 38) {
        // arrow UP
        setSelectedIndex((s) => (s === 0 ? 0 : s - 1));
      }
      // Escape key
      if (e.keyCode === 27) {
        inputRef.current && inputRef.current.blur();
      }
      // arrow right
      if (e.keyCode === 39 && isActive && suggestions.length) {
        // 右箭头键补全module name
        const target = suggestions[selectedIndex];

        if (target) {
          if (inputValue.trim().indexOf(target.name) !== 0) {
            setInputValue(target.name.trim());
          }
        }
      }
    };

    inputRef.current && inputRef.current.focus();

    window.addEventListener("keydown", pressKeys);

    return () => {
      window.removeEventListener("keydown", pressKeys);
    };
  }, [suggestions.length, inputValue, isActive, selectedIndex]);

  useEffect(() => {
    let [moduleStr, ...options] = inputValue.match(/(\b\S+)/g) || [""];
    moduleStr = moduleStr.toLowerCase().trim();
    if (moduleStr.length >= 1) {
      const list = sort(
        flatRoutes.map((v) => v.name),
        moduleStr
      ).map((item) => ({
        name: item[0],
        options,
      }));
      setSuggestions(list);
    } else {
      setSuggestions([]);
    }
    setSelectedIndex(0);
  }, [inputValue, flatRoutes]);

  useEffect(() => {
    wrapperRef.current = () => setIsActive(true)
  })

  if (!isActive) return <></>;

  return (
    <>
      <style>{styleStr}</style>
      <div className="spotlight active fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-opacity-30 bg-black">
        <div className="relative opacity-90 rounded-xl">
          <form onSubmit={handleSubmit} style={{ margin: 0 }}>
            <input
              className="focus:outline-none w-full p-2 pl-11 bg-gray-800 text-3xl rounded-xl border border-gray-500 placeholder-gray-400 text-gray-100 font-extralight"
              placeholder="模块加载器"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInput}
              onBlur={blur}
              style={{ outline: "none", fontSize: "20px" }}
            />
          </form>
          {suggestions.length >= 1 && (
            <ul className="-z-1 absolute top-full w-full bg-gray-800 border border-t-0 border-gray-500 -mt-3 rounded-b-xl pt-4 pb-1 px-1">
              {suggestions.map((route, i) => {
                const selected = i === selectedIndex;

                return (
                  <li
                    key={route.name}
                    onClick={() => {
                      rsdk.exec(route.name, ...route.options);
                      blur();
                    }}
                    className={`${
                      selected
                        ? "bg-blue-500 hover:bg-gray-600"
                        : "hover:bg-gray-500"
                    } px-3 py-1 flex justify-between rounded-lg`}
                  >
                    <div className="text-gray-200">{route.name}</div>
                    <div
                      className={`${
                        selected ? "text-gray-300" : "text-gray-500"
                      } text-sm italic`}
                    >
                      {route.name}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default function ({ rsdk, inIframe, ref }) {
  const spotLightWrapper = document.createElement("div");
  rsdk.container.appendChild(spotLightWrapper)
  ReactDom.render(<Spotlight rsdk={rsdk} inIframe={inIframe} wrapperRef={ref} />, spotLightWrapper);

  return ref
}