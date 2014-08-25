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

          var newItemView = Blaze.With(item, eachView.contentFunc);
          eachView.numItems++;

          if (eachView.expandedValueDep) {
            eachView.expandedValueDep.changed();
          } else if (eachView.domrange) {
            if (eachView.inElseMode) {
              eachView.domrange.removeMember(0);
              eachView.inElseMode = false;
            }

            var range = Blaze.materializeView(newItemView, eachView);
            eachView.domrange.addMember(range, index);

          } else {
            console.log(eachView);
            eachView.initialSubviews.splice(index, 0, newItemView);
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
          if (eachView.expandedValueDep) {
            eachView.expandedValueDep.changed();
          } else if (eachView.domrange) {
            itemView = eachView.domrange.getMember(index).view;
          } else {
            itemView = eachView.initialSubviews[index];
          }
          itemView.dataVar.set(newItem);
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
