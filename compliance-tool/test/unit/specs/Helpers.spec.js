import { editItem, unique } from '@/helpers'

describe('helpers', () => {
  test('editItem', () => {
    const originalList = [
      {
        id: 1,
        name: 'test name',
        anotherProperty: 'property value'
      },
      {
        id: 2,
        name: 'test name 2',
        anotherProperty: 'property value 2'
      }
    ]

    const editedList = []

    editItem(originalList, editedList, 'name', 'new name', 1)

    expect(editedList.length).toEqual(1)
  })

  test('unique', () => {
    const items = [
      {
        id: 1,
        name: 'test name',
        anotherProperty: 'value'
      },
      {
        id: 2,
        name: 'test name 2',
        anotherProperty: 'value 2'
      },
      {
        id: 3,
        name: 'test name 2',
        anotherProperty: 'value 2'
      },
      {
        id: 4,
        name: 'test name 4',
        anotherProperty: 'value 4'
      }
    ]

    expect(unique(items, 'anotherProperty')).toEqual([
      {
        id: 1,
        name: 'test name',
        anotherProperty: 'value'
      },
      {
        id: 2,
        name: 'test name 2',
        anotherProperty: 'value 2'
      },
      {
        id: 4,
        name: 'test name 4',
        anotherProperty: 'value 4'
      }
    ])
  })
})
