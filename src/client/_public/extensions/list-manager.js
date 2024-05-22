/**
 *
 * @param {string} templateName
 * @param {string} emptyTemplate
 * @param {!string} collection
 * @returns {list}
 */
function list(templateName, emptyTemplate, collection) {
  let count = 0

  this.id = this.attr("id") || this.data("id")
  this.name = this.data("name")

  this.ssr = !!collection
  // this.parent = null
  this.collection = collection
  this.items = []
  this.itemsEl = []
  this.groups = {}
  this.activeState = "!bg-base-lighter dark:!bg-base-pitch"
  this.inactiveState = "!bg-base-light dark:!bg-base-dark"
  this.activeElement = null
  this.defaultSort = "order"
  this.defaultOrder = "desc"
  this.defaultContext = {}
  this.selected = {}
  this.isGroup = false

  const withId = (context) => {
    if (!context.id) delete context.id
    return {
      id: $.uniqueId(8),
      ...context
    }
  };

  const removable = (item) =>
    $(".remove", item).on("click",() => this.removeItem(item.data("list-item")));

  const selectable = (item) => {
    $(`input[type="checkbox"][name="${item.id}-check"]`, item)
      .on("change", (e) => {
        this.select({
          field: $(e.target)
        })
      })
  }

  this.setItems = (items) => {
    this.items = items

    count = this.items.length;

    this.items
      .forEach((item) => {
        if (Array.isArray(item.children)) {
          this.getGroup(item.id)?.setItems(item.children)
        }
      })

    return this
  }

  this.setSSR = (value) => {
    this.ssr = value
    return this
  }

  this.setCollection = (value) => {
    this.collection = value
    this.ssr = !!value
    return this
  }

  this.setActiveState = (active, inactive, activeElement) => {
    this.activeState = active || this.activeState
    this.inactiveState = inactive || this.inactiveState
    this.activeElement = activeElement || this.activeElement
    return this
  }

  this.setDefaultSort = (sort, order) => {
    this.defaultSort = sort
    this.defaultOrder = order

    this.getGroups()?.forEach(
      group => group.setDefaultSort(sort, order)
    )

    return this;
  }

  this.setDefaultContext = (context = {}) => {
    this.defaultContext = context || {}

    this.getGroups()?.forEach(
      group => group.setDefaultContext(context)
    )

    return this
  }

  this.setAsGroup = (isGroup) => {
    this.isGroup = isGroup
    return this
  }

  this.newItem = (context) => $($.template(templateName)(context).trim());

  this.createGroup = (group, context = {}) => {
    const children = group.children
    group.children = []

    const newGroup = this.newItem(group, context)

    const childrenEl = $(`div[data-list-children="${group.id}"]`, newGroup)

    this.groups[group.id] = childrenEl.list(
      templateName, emptyTemplate, collection
    )

    this.groups[group.id]
      .setItems(children)
      .setAsGroup(true)
      .setDefaultSort(
        this.defaultSort,
        this.defaultOrder
      )
      .sort()
      .update(context)

    return newGroup
  }

  this.size = () => this.all().length

  this.reset = () => {
    count = 0;
    this.items = []
    this.itemsEl = []
    this.groups = {}

    if (emptyTemplate) {
      return this.render(emptyTemplate, { ...this.defaultContext, count })
    }

    this.html("");
  };

  this.all = () => this.items

  this.allEl = () => this.itemsEl

  this.previous = (id) => {
    const i = this.index(id)
    return this.items[(i - 1) < 0 ? 0 : i - 1];
  }

  this.next = (id) => {
    const i = this.index(id)
    return this.items[(i + 1) > this.items.length ? this.items.length : i + 1];
  }

  this.first = () => this.items.at(0)

  this.last = () => this.items.at(this.items.length - 1)

  this.firstEl = () => this.itemsEl.at(0)

  this.lastEl = () => this.itemsEl.at(this.itemsEl.length - 1)

  this.index = (id) => this.items.findIndex(item => item.id == id)

  this.load = (params, responseCallback) => {
    if (!this.ssr) {
      return new Promise((resolve, reject) => reject("SRR must be enabled before calling .load()"));
    }

    return fetch(`/_api/${this.collection}/?${$.searchParams(params)}`, {
      headers: {
        "Cache-control": "must-revalidate,no-cache,no-store"
      }
    })
      .then((response) => response.json())
      .then(typeof responseCallback === "function" ? responseCallback : response => response)
      .then((items) => {
        this.reset();
        this.clearActive()
        this.selected = {}

        if (Array.isArray(items)) {
          items.forEach((item) => {
            this.appendItem({ ...item, __collection: this.collection })
          });

          this.items = items
        } else if ("items" in items) {
          items.items.forEach((item) => {
            this.appendItem({ ...item, __collection: this.collection })
          });

          this.items = items.items
        } else {
          this.items = []
        }

        this.trigger("hb-list-loaded", {
          id: this.attr("id"),
          collection: this.collection,
          ...items,
          items: this.items
        })


        return this.items;
      });
  }

  /**
   * Load existing rows using static data attributes
   */
  this.loadStatic = () => {
    count = 0;
    this.items = []
    this.itemsEl = []
    this.groups = {}

    $("[data-list-item]", this).each((i, el) => {
      const row = $(el)
      const data = row.data()

      data.id = data.listItem

      delete data.listItem

      this.items.push(data)
      this.itemsEl.push(row)

      removable(row);
      selectable(row);

      ++count

      this.dispatch("appended", data)
    })
  }

  this.hasSelected = () => {
    const has = Object.keys(this.selected)
      .some(id => this.selected[id])

    if (!has) {
      return this.getGroups().find(group => group.hasSelected())
    }

    return has
  }

  this.getSelected = () => {
    return Object.keys(this.selected)
      .filter(id => this.selected[id])
      .map((id) => {
        const item = this.getItem(id)

        if (item.children) {
          item.children = this.getGroup(item.id).getSelected()
        }

        return item
      })
  }

  this.select = (e) => {
    this.selected[e.field.data("id")] = e.field.get(0).checked

    this.trigger("hb-selection-changed", {
      field: e.field,
      value: e.field.get(0).checked,
      selected: this.selected,
      count: this.getSelected().length
    })
  }

  this.selectAll = (e) => {
    const { checked } = e._el.get(0)
    if (checked) {
      this.all().forEach(item => {
        if (item.name === "id") return;

        this.selected[item.id] = true
        $(`input[name="${item.id}-check"]`).prop("checked", true)

        if (item.children) {
          this.getGroup(item.id).selectAll(e)
        }
      })
    } else {
      this.all().forEach(item => {
        if (item.name === "id") return;

        this.selected[item.id] = false
        $(`input[name="${item.id}-check"]`).prop("checked", false)

        if (item.children) {
          this.getGroup(item.id).selectAll(e)
        }
      })
    }

    this.trigger("hb-selection-changed", {
      value: checked,
      selected: this.selected,
      count: this.getSelected().length
    })
  }

  this.getActiveElement = (id) => {
    const itemEl = this.getItemEl(id)

    if (itemEl) {
      return this.activeElement ? $(this.activeElement, itemEl) : itemEl
    }
  }

  this.clearSelected = () => {
    this.getSelected().forEach((item) => {
      if (Array.isArray(item.children)) {
        this.getGroup(item.id)?.clearSelected()
      }

      const itemEl = this.getItemEl(item.id)

      $(`input[type="checkbox"][name$=-check]`, itemEl)
        .removeProp("checked")

      delete this.selected[item.id]
    })
    this.selected = {}
  }

  this.clearActive = () => {
    this.all()
      .forEach((item) => {
        if (item.children) {
          this.getGroups().forEach(g => g.clearActive())
        }
        const activeEl = this.getActiveElement(item.id)
        activeEl?.removeClass(this.activeState)
        activeEl?.addClass(this.inactiveState)
    })
  }

  this.setActive = (id, on) => {
    this.clearActive()

    const activeEl = this.getActiveElement(id)
    if (!activeEl) {
      return;
    }

    if (on) {
      activeEl.swapClass(this.inactiveState, this.activeState)
    } else {
      activeEl.swapClass(this.activeState, this.inactiveState)
    }
  }

  this.getItem = (id, groupIdOrName = null) => {
    if (groupIdOrName) {
      return this.getGroup(groupIdOrName).getItem(id)
    }

    const item = this.items.find(item => item.id == id)

    if (item) return $.utils.merge({}, item)
  }

  this.getGroup = (idOrName) => {
    const groups = this.getGroups()
    return groups.find(g => g.id === idOrName || g.name === idOrName)
  }

  this.getGroups = () => Object.keys(this.groups)
    .map(g => this.groups[g])

  this.getItemByIndex = (index, groupIdOrName = null) => {
    if (groupIdOrName) {
      return this.getGroup(groupIdOrName).getItemByIndex(index)
    }
    return this.items.find(item => item.id == id)
  }

  this.getItemEl = (id, groupName) => {
    if (groupName) {
      const group = this.getItem()
    }
    return this.itemsEl.find(item => item.data("list-item") == id)
  }

  this.dispatch = (type, item) => {
    this.trigger("hb-list-changed", {
      type,
      item,
      el: this.getItemEl(item?.id || item),
      count,
      lastCount: type === "removed" ? count + 1 : count - 1,
    })
  }

  this.sort = (by, direction) => {
    by = by || this.defaultSort
    direction = direction || this.defaultOrder

    let items = $.utils.sort(by, direction, this.all())

    this.setItems(items)

    items.forEach((item) => {
      if (Array.isArray(item.children)) {
        this.getGroup(item.id)?.sort(by, direction)
      }
    })

    return this;
  }

  this.update = (extraContext = {}) => {
    const items = this.all()
    this.reset()

    items
      .forEach(item => this.appendItem(item, extraContext))

    return this
  }

  this.removeItem = (id, groupId = null) => {
    if (groupId) {
      return this.groups[groupId].removeItem(id)
    }

    const elem = this.getItemEl(id)

    elem.remove()

    --count;

    if (count === 0 && emptyTemplate) {
      this.html($.template(emptyTemplate)({ ...this.defaultContext, count }));
    }

    this.items.forEach((item, i) => {
      if (item.id == id) {
        this.items.splice(i, 1)
      }
    })

    this.itemsEl.forEach((item, i) => {
      if (item.data("list-item") == id) {
        this.itemsEl.splice(i, 1)
      }
    })

    delete this.selected[id]

    this.fixOrder()

    this.dispatch("removed", id)

    return this;
  };

  this.prependItem = (userContext = {}, extraContext = {}) => {
    if (userContext.groupName) {
      this.getGroup(userContext.groupName)?.prependItem(userContext, extraContext)
      return this
    }

    const context = withId(userContext)

    let item;
    if (context.children) {
      item = this.createGroup(context, extraContext)
    } else {
      item = this.newItem({
        ...this.defaultContext,
        ...context,
        ...extraContext,
        count: count + 1
      });
    }

    if (count === 0) {
      this.html(item.get(0).outerHTML);
    } else {
      this.prepend(item);
    }

    removable(item);
    selectable(item);

    item.data("list-item", context.id)

    this.items.unshift(context)
    this.itemsEl.unshift(item)

    ++count;

    this.dispatch("prepended", context)

    return this;
  };

  this.appendItem = (userContext = {}, extraContext = {}) => {
    if (userContext.groupName) {
      const group = this.getGroup(userContext.groupName)

      if (group?.isGroup) {
        group?.appendItem(userContext, extraContext)
        return this
      }
    }

    const context = withId(userContext)

    let item;
    if ("children" in context) {
      item = this.createGroup(context, extraContext)
    } else {
      item = this.newItem({
        ...this.defaultContext,
        ...context,
        ...extraContext,
        count: count + 1
      });
    }

    // remove emptymessage before adding items
    if (this.itemsEl.length === 0) {
      const emptyMessage = this.children().get(0)

      if (emptyMessage) {
        emptyMessage.remove()
      }
    }

    this.append(item);

    removable(item);
    selectable(item);

    item.data("list-item", context.id)

    this.items.push(context)
    this.itemsEl.push(item)

    ++count;

    this.dispatch("appended", context)

    return this;
  };

  this.insertAfter = (targetIndex, userContext = {}, extraContext = {}) => {
    if (userContext.groupName) {
      this.getGroup(userContext.groupName)?.insertAfter(targetIndex, userContext, extraContext)
      return this
    }

    const context = withId(userContext)
    const item = this.newItem({
      ...this.defaultContext,
      ...context,
      ...extraContext,
      count: count + 1
    });
    const target = this.all()[targetIndex]
    const targetEl = this.getItemEl(target.id)

    if (targetEl) {
      targetEl.after(item)

      item.data("list-item", context.id)

      this.items.splice((targetIndex + 1), 0, context)
      this.itemsEl.splice((targetIndex + 1), 0, item)

      ++count;

      this.dispatch("inserted-after", context)
    }

    return this;
  }

  this.insertBefore = (targetIndex, userContext = {}, extraContext = {}) => {
    if (userContext.groupName) {
      this.getGroup(userContext.groupName)?.insertBefore(targetIndex, userContext, extraContext)
      return this
    }

    const context = withId(userContext)
    const item = this.newItem({
      ...this.defaultContext,
      ...context,
      ...extraContext,
      count: count + 1
    });
    const target = this.all()[targetIndex]
    const targetEl = this.getItemEl(target.id)

    if (targetEl) {
      targetEl.before(item)

      item.data("list-item", context.id)

      this.items.splice((targetIndex - 1), 0, context)
      this.itemsEl.splice((targetIndex - 1), 0, item)

      ++count;

      this.dispatch("inserted-before", context)
    }

    return this;
  }

  this.replaceItem = (newItem, extraContext = {}) => {
    if (newItem.groupName) {
      this.getGroup(newItem.groupName)?.replaceItem(newItem, extraContext)
      return this
    }

    if (!newItem.id) return this;

    const newItemEl = this.newItem({
      ...this.defaultContext,
      ...newItem,
      ...extraContext,
      count
    });

    removable(newItemEl);
    selectable(newItemEl);

    this.getItemEl(newItem.id).replaceWith(newItemEl);

    this.items = this.items.map(item => {
      if (item.id == newItem.id) {
        return newItem
      }
      return item
    })

    this.itemsEl = this.itemsEl.map(itemEl => {
      if (itemEl.data("list-item") == newItem.id) {
        return newItemEl
      }
      return itemEl
    })

    this.dispatch("replaced", newItem)

    return this;
  };

  this.moveUp = (id) => {
    const fields = this.all()
    const index = fields.findIndex(f => f.id === id)

    if (index === -1 || index === 0) {
      return this;
    }

    const temp = fields[index - 1];
    fields[index - 1] = fields[index];
    fields[index] = temp;

    this.setItem(fields)

    this.update({})

    return this;
  }

  this.moveDown = (id) => {
    const fields = this.all()
    const index = fields.findIndex(f => f.id === id)

    if (index === -1 || index === 0) {
      return this;
    }

    const temp = fields[index + 1];
    fields[index + 1] = fields[index];
    fields[index] = temp;

    this.setItem(fields)

    this.update({})

    return this;
  }

  this.fixOrder = () => {
    const allFields = this.sort().all()
    const list = []
    const id = allFields.find(item => item.name === "id")

    if (id) {
      id.order = 0
      list.push(id)
    }

    for (let i = 0; i < allFields.length; i++) {
      if (allFields[i].name === "id") continue;
      allFields[i][this.defaultSort] = i;

      if (allFields[i].children) {
        this.getGroup(allFields[i].id)?.fixOrder()
        allFields[i].children = this.getGroup(allFields[i].id)?.all()
      }

      list.push(allFields[i])
    }

    this.setItems(list).sort()

    return this
  }

  this.changedOrder = (field, value) => {
    const allFields = this.sort().all()

    const index = this.index(field.id)

    field[this.defaultSort] = value

    allFields.splice(index, 1)
    allFields.splice(value, 0, field)

    return this
      .setItems(allFields)
      .fixOrder()
  }

  this.push = (item) => {
    this.items.push(item)
    ++count
    return this
  }

  this.click = (index) => {
    this.children().eq(index).trigger("click");
  };

  if (count === 0 && emptyTemplate) {
    this.html($.template(emptyTemplate)({
      ...this.defaultContext,
      count
    }));
  }

  return this;
}


(() => {
  if ($ === undefined) return;

  $.fn.extend({
    list: list,
  });
})();