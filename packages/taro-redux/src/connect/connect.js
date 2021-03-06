import { getStore } from '../utils/store'

export default function connect (mapStateToProps, mapDispatchToProps) {
  const store = getStore()
  const dispatch = store.dispatch
  const initMapDispatch = typeof mapDispatchToProps === 'function' ? mapDispatchToProps(dispatch) : {}
  initMapDispatch.dispatch = dispatch;

  const stateListener = function () {
    let isChanged = false
    const newMapState = mapStateToProps(store.getState())
    Object.keys(newMapState).forEach(key => {
      const val = newMapState[key]
      if (this.props[key] !== val) {
        this.props[key] = val
        isChanged = true
      }
    })
    const isPageHide = this.$root ? this.$root.$isPageHide : this.$isPageHide
    if (isChanged && !isPageHide) {
      this.setState({})
    }
  }

  return function connectComponent (Component) {
    let unSubscribe = null
    return class Connect extends Component {
      constructor () {
        super(Object.assign(...arguments, mapStateToProps(store.getState()), initMapDispatch))
        Object.keys(initMapDispatch).forEach(key => {
          this[`__event_${key}`] = initMapDispatch[key]
        })
      }

      componentWillMount () {
        const store = getStore()
        Object.assign(this.props, mapStateToProps(store.getState()), initMapDispatch)
        unSubscribe = store.subscribe(stateListener.bind(this))
        if (super.componentWillMount) {
          super.componentWillMount()
        }
      }

      componentDidShow () {
        this.$isPageHide = false
        if (super.componentDidShow) {
          super.componentDidShow()
        }
      }

      componentDidHide () {
        this.$isPageHide = true
        if (super.componentDidHide) {
          super.componentDidHide()
        }
      }

      componentWillUnmount () {
        if (super.componentWillUnmount) {
          super.componentWillUnmount()
        }
        if (unSubscribe) {
          unSubscribe()
        }
        unSubscribe = null
      }
    }
  }
}
