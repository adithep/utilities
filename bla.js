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
          var obj, num, nid;
          var newItemView = Mu.With(item, eachView.contentFunc);
          eachView.numItems++;
          if (item.ctl && item.get_slave_num) {
            obj = item.get_slave_num(eachView.idArr);
            num = obj.num;
            nid = obj.id;
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
              eachView.idArr[index] = nid;
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
              eachView.idArr[index] = nid;
            }

          }

        });
      },
      removedAt: function (id, item, index) {
        Deps.nonreactive(function () {
          var len;
          eachView.numItems--;
          if (item.ctl && item.get_slave_num) {
            obj = item.get_slave_num(eachView.idArr);
            if (obj.num || obj.num === 0) {
              index = obj.num;
            }
          }
          if (eachView.expandedValueDep) {
            eachView.expandedValueDep.changed();
          } else if (eachView.domrange) {
            itemDat = eachView.domrange.getMember(index).view.dataVar.get();
            itemDat.unjoin_doc(item.doc);
            if (Object.keys(itemDat.doc).length === 0) {
              eachView.domrange.removeMember(index);
            } else {
              eachView.domrange.getMember(index).view.dataVar.set(itemDat);
              if (item.check_slave && item.check_slave()) {
                len = eachView.domrange.members.length - 1;
                eachView.domrange.moveMember(index, len);
                eachView.idArr.splice(index, 1);
                eachView.idArr.splice(len, 0, obj.id);

              }
            }

            if (eachView.elseFunc && eachView.numItems === 0) {
              eachView.inElseMode = true;
              eachView.domrange.addMember(
                Blaze.materializeView(
                  Blaze.View('each_else',eachView.elseFunc),
                  eachView), 0);
            }
          } else {
            itemDat = eachView.initialSubviews[index].initd();
            itemDat.unjoin_doc(item);
            if (Object.keys(itemDat.doc).length === 0) {
              eachView.initialSubviews.splice(index, 1);
            } else {
              var nnewItemView = Mu.With(itemDat, eachView.contentFunc);
              if (item.check_slave && item.check_slave()) {
                len = eachView.initialSubviews.length - 1;
                eachView.initialSubviews.splice(index, 1);
                eachView.initialSubviews.splice(len, 0, nnewItemView);
                eachView.idArr.splice(index, 1);
                eachView.idArr.splice(len, 0, obj.id);

              } else {
                eachView.initialSubviews[index] = nnewItemView;
              }
            }

          }



        });
      },
      changedAt: function (id, newItem, oldItem, index) {
        Deps.nonreactive(function () {
          var itemView, obj;
          if (newItem.ctl && newItem.get_slave_num) {
            obj = newItem.get_slave_num(eachView.idArr);
            if (obj.num || obj.num === 0) {
              index = obj.num;
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
          var obj;
          if (!item.check_slave || item.check_slave()) {

            if (item.check_slave) {
              obj = item.get_slave_num(eachView.idArr);
              if (obj && obj.num >= 0 && obj.num !== fromIndex) {
                toIndex = toIndex - (fromIndex - obj.num);
                fromIndex = obj.num;
                var log_obj = {
                  idArr: idArr,
                  obj: obj,
                  fromIndex: fromIndex,
                  toIndex: toIndex
                };
              }
            }

            eachView.idArr.splice(fromIndex, 1);
            eachView.idArr.splice(toIndex, 0, obj.id);

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
