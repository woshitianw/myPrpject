(function($){$.fn.hdDropDownList = function(opt){
    if(opt == null){
      opt={};
    }
console.log('custom hdDropDownList');
var self=this;
var selfdom = $(this)[0];
$(this).addClass('hd-dropdownlist');
var selectdom = $("<select></select>").appendTo($(this));
var textInput = $("<input type='text' placeholder='输入/选择'/>").appendTo($(this));
if(opt.items == null){
  opt.items = [];
}
var w = $(this).width()-25;
textInput.css('position','absolute');
textInput.css('width',w+'px');
selectdom.css('height',$(this).height());
selectdom.css('width',$(this).width());
selectdom.css('position','absolute');
for(var i=0;i<opt.items.length;i++) {
  var item = opt.items[i]
  var option = $("<option>"+item+"</option>").appendTo(selectdom);
  option.attr('value',item);
}
$(selectdom)[0].selectedIndex=-1;
    
    $(selectdom).change(function(evt){
      var txt = $(selectdom).val();
      console.log(txt);
      $(textInput).val(txt);
    });
    
    function val(){
      return $(textInput).val();
    }
    
    return {dom:$(this)[0],
            val:val
            };
    
  }})(jQuery);