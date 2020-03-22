/* 学员目前只渲染一个静态表格 */
layui.use(['table'],function(){
    var table=layui.table;
    table.render({
        elem:'#studentSheet',
        cols:[[
            {field:'id',title:'学号',width:100,fixed:'left',sort:true}
           ,{field:'name',title:'姓名',width:100}
           ,{field:'age',title:'年龄',width:50,sort:true}
           ,{field:'sex',title:'性别',width:50,sort:true}
           ,{field:'date',title:'入学时间',width:120}
           ,{field:'class',title:'班级',width:100}
           ,{field:'parents',title:'家长姓名',width:120}
           ,{field:'address',title:'地址'}
        ]],
        toolBar:true,
        page:true,
        limit:5,
        limits:[5,10,15],
        data:JSON.parse(localStorage.studentInfo),
        id:'studentSheet'
    });
});