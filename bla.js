Mu.With = function (data, contentFunc) {
  var view = Blaze.View('with', contentFunc);

  view.dataVar = new Blaze.ReactiveVar;

  view.initd = function () {
    return data;
  };

  view.onCreated(function () {
    if (typeof data === 'function') {
      // `data` is a reactive function
      view.autorun(function () {
        view.dataVar.set(data());
      }, view.parentView);
    } else {
      view.dataVar.set(data);
    }
  });

  return view;
};

Mu.Eacha = function (argFunc, contentFunc, elseFunc) {
  var eachView = Blaze.View('each', function () {
    var subviews = this.initialSubviews;
    this.initialSubviews = null;
    if (this.isCreatedForExpansion) {
      this.expandedValueDep = new Deps.Dependency;
      this.expandedValueDep.depend();
    }
    return subviews;
  });
  eachView.idArr = [];
  eachView.initialSubviews = [];
  eachView.numItems = 0;
  eachView.inElseMode = false;
  eachView.stopHandle = null;
  eachView.contentFunc = contentFunc;
  eachView.elseFunc = elseFunc;
  eachView.argVar = new Blaze.ReactiveVar;

  eachView.onCreated(function () {
    // We evaluate argFunc in an autorun to make sure
    // Blaze.currentView is always set when it runs (rather than
    // passing argFunc straight to ObserveSequence).
    eachView.autorun(function () {
      eachView.argVar.set(argFunc().c_yield());
    }, eachView.parentView);

    eachView.stopHandle = ObserveSequence.observe(function () {
      return eachView.argVar.get();
    }, {
      addedAt: function (id, item, index) {
        Deps.nonreactive(function () {
          var num;
          var newItemView = Mu.With(item, eachView.contentFunc);
          eachView.numItems++;
          if (item.ctl && item.get_slave_num) {
            num = item.get_slave_num(eachView.idArr);
          }
          var itemView, idata, dkey;
          if (eachView.expandedValueDep) {
            eachView.expandedValueDep.changed();
          } else if (eachView.domrange) {
            if (eachView.inElseMode) {
              eachView.domrange.removeMember(0);
              eachView.inElseMode = false;
            }
            if (num || num === 0) {
              itemView = eachView.domrange.getMember(num).view;
              idata = itemView.dataVar.get();
              idata.join_doc(item.doc);
              itemView.dataVar.set(idata);
            } else {
              var range = Blaze.materializeView(newItemView, eachView);
              eachView.domrange.addMember(range, index);
              eachView.idArr[index] = id;
            }


          } else {
            if (num || num === 0) {

              itemView = eachView.initialSubviews[num];
              idata = itemView.initd();
              idata.join_doc(item.doc);
              var nnewItemView = Mu.With(idata, eachView.contentFunc);
              eachView.initialSubviews[num] = nnewItemView;
            } else {
              eachView.initialSubviews.splice(index, 0, newItemView);
              eachView.idArr[index] = id;
            }

          }

        });
      },
      removedAt: function (id, item, index) {
        Deps.nonreactive(function () {
          eachView.numItems--;
          if (eachView.expandedValueDep) {
            eachView.expandedValueDep.changed();
          } else if (eachView.domrange) {
            eachView.domrange.removeMember(index);
            if (eachView.elseFunc && eachView.numItems === 0) {
              eachView.inElseMode = true;
              eachView.domrange.addMember(
                Blaze.materializeView(
                  Blaze.View('each_else',eachView.elseFunc),
                  eachView), 0);
            }
          } else {
            eachView.initialSubviews.splice(index, 1);
          }
        });
      },
      changedAt: function (id, newItem, oldItem, index) {
        Deps.nonreactive(function () {
          var itemView;
          if (newItem.ctl && newItem.get_slave_num) {
            num = newItem.get_slave_num(eachView.idArr);
            if (num || num === 0) {
              index = num;
            }
          }
          if (eachView.expandedValueDep) {
            eachView.expandedValueDep.changed();
          } else if (eachView.domrange) {
            itemView = eachView.domrange.getMember(index).view;
          } else {
            itemView = eachView.initialSubviews[index];
          }
          nitem = itemView.dataVar.get();
          nitem.join_doc(newItem.doc);
          itemView.dataVar.set(nitem);
        });
      },
      movedTo: function (id, item, fromIndex, toIndex) {
        Deps.nonreactive(function () {
          if (eachView.expandedValueDep) {
            eachView.expandedValueDep.changed();
          } else if (eachView.domrange) {
            eachView.domrange.moveMember(fromIndex, toIndex);
          } else {
            var subviews = eachView.initialSubviews;
            var itemView = subviews[fromIndex];
            subviews.splice(fromIndex, 1);
            subviews.splice(toIndex, 0, itemView);
          }
        });
      }
    });

    if (eachView.elseFunc && eachView.numItems === 0) {
      eachView.inElseMode = true;
      eachView.initialSubviews[0] =
        Blaze.View('each_else', eachView.elseFunc);
    }
  });

  eachView.onDestroyed(function () {
    if (eachView.stopHandle)
      eachView.stopHandle.stop();
  });

  return eachView;
};
